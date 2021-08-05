import { DynConfig } from "./DynConfig";

export const _debug = function (msg: any, persistent: boolean | number) {
    if (!DynConfig.debug) return;
    if (_debug._debugPanel == null) {
        var panel = document.createElement('div');
        panel.className = 'debug-info';
        panel.style.position = 'fixed';
        panel.style.left = '0px';
        panel.style.bottom = '0px';
        panel.style.padding = '10px';
        panel.style.backgroundColor = '#000';
        panel.style.color = '#FFF';
        document.body.appendChild(panel);
        _debug._debugPanel = panel;
    }
    _debug._debugPanel.style.display = 'block';
    _debug._debugPanel.innerHTML += JSON.stringify(msg) + '<br/>';
    if (persistent === true) { }
    else {
        clearTimeout(_debug._debugPanel.timer);
        _debug._debugPanel.timer = setTimeout(function (obj: HTMLElement) {
            obj.style.display = 'none';
            obj.innerHTML = '';
        }, persistent || 5000, _debug._debugPanel);
    }
} as any;