import * as vscode from 'vscode';

let out: vscode.OutputChannel;
const prevLocals = new Map<string, string>();

export function activate(context: vscode.ExtensionContext) {
	out = vscode.window.createOutputChannel('C Visual Debugger');
	out.show(true);
	const trackerDisposable =
		vscode.debug.registerDebugAdapterTrackerFactory('cppdbg', {
			createDebugAdapterTracker(session) {
				out.appendLine(`Tracker attached: ${session.name}`);

				return {
					onDidSendMessage: async (msg: any) => {
						if (msg?.type !== 'event' || msg?.event !== 'stopped') return;

						const reason = msg.body?.reason ?? 'unknown';
						out.appendLine(`STOPPED: reason=${reason}`);

						try {
							const locals = await getLocals(session);

							for (const v of locals) {
								const prev = prevLocals.get(v.name);
								const curr = v.value;

								if (prev === undefined) {
									out.appendLine(`  ${v.name} = ${curr}`);
								} else if (prev !== curr) {
									out.appendLine(`  ${v.name}: ${prev} -> ${curr}`);
								}

								prevLocals.set(v.name, curr);
							}
						} catch (e: any) {
							out.appendLine(`getLocals failed: ${e?.message ?? String(e)}`);
						}
					}
				};
			}
		});
	context.subscriptions.push(trackerDisposable);
}

export function deactivate() {}

async function getLocals(session: vscode.DebugSession): Promise<Array<{ name: string; value: string }>> {
	const threadsResp = await session.customRequest('threads');
	const threadId = threadsResp?.threads?.[0]?.id;
	if (!threadId) throw new Error('No threadId');

	const stackResp = await session.customRequest('stackTrace', {threadId});
	const frameId = stackResp?.stackFrames?.[0]?.id;
	if (!frameId) throw new Error('No frameId');

	const scopesResp = await session.customRequest('scopes', {frameId});

	const localsScope = (scopesResp?.scopes ?? []).find((s: any) =>
		typeof s?.name === 'string' && s.name.toLowerCase().includes('local')
	) ?? scopesResp?.scopes?.[0];
	
	const variablesReference = localsScope?.variablesReference;
	if (!variablesReference) return [];

	const varsResp = await session.customRequest('variables', {variablesReference});
	const vars = varsResp?.variables ?? [];

	return vars
		.filter((v: any) => typeof v?.name === 'string')
		.map((v: any) => ({name: String(v.name), value: String(v.value ?? '')}));
}