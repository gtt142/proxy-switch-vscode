import * as vscode from 'vscode';

const PROXY_URL_REGEX = '^https?://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$';

export function activate(context: vscode.ExtensionContext) {
	const healthcheckDisposable = vscode.commands.registerCommand('proxy-switch.healthcheck', () => {
		vscode.window.showInformationMessage('ProxySwitch is OK ✅');
	});

	const RELOAD_NOW_TEXT = 'Reload Now';

	const setHttpProxyDisposable = vscode.commands.registerCommand('proxy-switch.setHttpProxy', async () => {
		const defaultProxy = 'http://127.0.0.1:9080';
        let proxy = await vscode.window.showInputBox({ prompt: `Enter the new 'http.proxy' address (defualt ${defaultProxy}).` });
		if (proxy) {
			if (!isValidHttpUrl(proxy)) {
				vscode.window.showErrorMessage(`Invalid value for proxy address: '${proxy}' ❌ (Value must match regex: \`${PROXY_URL_REGEX}\`)`);
				return;
			}
			vscode.window.showInformationMessage(`Your value is '${proxy}' 📍`);
		} else {
			vscode.window.showInformationMessage(`Default value (${defaultProxy}) will be used 📍`);
			proxy = defaultProxy;
		}
		// proxy is valid or has default value
		const config = vscode.workspace.getConfiguration('http');
		await config.update('proxy', proxy, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(`HTTP proxy set to '${proxy}' 🌐`, RELOAD_NOW_TEXT).then(selection => {
			if (selection === RELOAD_NOW_TEXT) {
                reloadWindow();
            }
		});
    });

	const turnOffHttpProxyDisposable = vscode.commands.registerCommand('proxy-switch.turnOffHttpProxy', async () => {
		const config = vscode.workspace.getConfiguration('http');
		await config.update('proxy', undefined, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(`HTTP proxy disabled 🏁`, RELOAD_NOW_TEXT).then(selection => {
			if (selection === RELOAD_NOW_TEXT) {
                reloadWindow();
            }
		});
    });

	const reloadWindowDisposable = vscode.commands.registerCommand('proxy-switch.reloadWindow', () => {
        reloadWindow();
    });

	context.subscriptions.push(healthcheckDisposable);
	context.subscriptions.push(setHttpProxyDisposable);
	context.subscriptions.push(turnOffHttpProxyDisposable);
	context.subscriptions.push(reloadWindowDisposable);
}

export function deactivate() {}


function isValidHttpUrl(url: string): boolean {
	const pattern = new RegExp(PROXY_URL_REGEX, 'i');
	return pattern.test(url);
}


function reloadWindow() {
	vscode.commands.executeCommand('workbench.action.reloadWindow');
}
