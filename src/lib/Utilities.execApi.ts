import { DynConfig } from "./DynConfig";
import { _debug } from "./Utilities.debug";
/*
type PostData = {
    headers: { [name: string]: string }
    body: any,
    method: string,
    shouldCancel: boolean
};
*/
export const execApiAsync = function (url: string, requestData: any, recalled?: boolean): Promise<Response> {
    if (requestData && requestData.shouldCancel === true) {
        if(requestData.localData == undefined){
            return new Promise<Response>((resolve, _) => {
                const response = new Response('null');
                resolve(response);
            });
        }
        else{
            return new Promise<Response>((resolve, _) => {
                _debug('return local data if any and cancel call api: ' + url);
                const response = new Response(JSON.stringify(requestData.localData));
                resolve(response);
            });
        }
        
    }
    else {
        if (!recalled) toggleLoadingPanel(true);
        const cachedName = JSON.stringify({ url, requestData });
        const cachedData = execApiAsync.CachedPool.get(cachedName);
        if (cachedData) {
            if (cachedData.execApiAsyncState === 'processing') {
                
                return new Promise<Response>((_, reject) => {
                    setTimeout(() => {
                        reject(null);
                    }, 5);

                }).catch(d => {
                    return execApiAsync(url, requestData, true);

                });
            }
            else return new Promise<Response>((resolve, _) => {
                _debug('load from cache: ' + url);
                const response = new Response(cachedData);
                resolve(response);
                toggleLoadingPanel(false);
            });
        }
        const expired = new Date();
        expired.setTime(expired.getTime() + 1 * 60000);// wait for 1 minute, then request URL
        if (DynConfig.apiCache) execApiAsync.CachedPool.set(cachedName, { execApiAsyncState: 'processing' }, expired);
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        let method = 'GET';
        if (requestData) {
            if (requestData.body) {
                let customRequestConfig = null as { method?: string, headers?: { [name: string]: string }, body: any };
                customRequestConfig = {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body
                };
                if (customRequestConfig.headers) for (let h in customRequestConfig.headers) {
                    headers.append(h, customRequestConfig.headers[h]);
                }
                requestData = customRequestConfig.body;
                if (requestData) {
                    method = customRequestConfig.method || 'POST';
                    if (typeof requestData != 'string') if (!(requestData instanceof FormData)) {
                        headers.append('Content-Type', 'application/json');
                        requestData = JSON.stringify(requestData);
                    }
                }


            }
            else {
                method = 'POST';
                if (!(requestData instanceof FormData)) {
                    headers.append('Content-Type', 'application/json');
                    requestData = JSON.stringify(requestData);
                }

            }
        }
        return fetch(window.utilities.resolveUrl(url), {
            method,
            credentials: 'include',
            body: requestData,
            headers: headers
        }).then(res => {
            if (res.ok) {
                return res.text().then(s => {
                    const expired = new Date();
                    expired.setTime(expired.getTime() + 5000);//cache 5 seconds
                    if (DynConfig.apiCache) execApiAsync.CachedPool.set(cachedName, s, expired);
                    return new Promise<Response>((resolve, _) => {
                        resolve(new Response(s));
                        toggleLoadingPanel(false);
                    });
                }).catch(r => {
                    return new Promise<Response>((_, reject) => {
                        reject(r);
                        toggleLoadingPanel(false);
                    });
                });
            }
            else {
                return new Promise<Response>((_, reject) => {
                    execApiAsync.CachedPool.del(cachedName);
                    reject({
                        url,
                        status: res.status,
                        statusText: res.statusText,
                        requestData: JSON.parse(requestData)
                    });
                    toggleLoadingPanel(false);
                });
                
            }
        });
    }

};
execApiAsync.CachedPool = {
    caches: {} as { [name: string]: { data: any, expired: Date } },
    set: function (name: string, data: any, expired: Date) {
        this.cleanup();
        this.caches[name] = { data, expired };
    },
    get: function (name: string) {
        this.cleanup();
        return this.caches[name]?.data;
    },
    del: function (name: string) {
        delete this.caches[name];
    },
    cleanup: function () {
        for (const name in this.caches) if (this.caches[name].expired < new Date()) delete this.caches[name];
    }
};

//toggleLoadingPanel.toggleCnt = 0;
export const toggleLoadingPanel = window.toggleLoadingPanel || function (visible: boolean) {

    let panel = toggleLoadingPanel.panel;
    if (!panel) {
        //search for existing html element
        panel = document.getElementsByClassName('loading-panel')[0];
        if (panel) {
            panel.spin = document.getElementsByClassName('loading-spin')[0];
            panel.shownCnt = 1;
            //_debug('init..' + visible + ', show count:' + panel.shownCnt);
        }
        else {
            panel = document.createElement('div');

            panel.spin = document.createElement('div');
            //<style>@keyframes spin360 { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }</style>
            const dynamicStyles = document.createElement('style');
            document.head.appendChild(dynamicStyles);
            dynamicStyles.sheet.insertRule('@keyframes spin360 { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }', 0);
            panel.shownCnt = 0;

        }
        toggleLoadingPanel.panel = panel;

        panel.className = 'loading-panel';


        const style = panel.style;
        style.zIndex = '9999';
        style.opacity = 0.5;
        style.position = 'fixed';
        style.width = '100%';
        style.height = '100%';
        style.backgroundColor = '#CCC';

        const spin = panel.spin;
        spin.innerHTML = '֎';
        spin.className = 'loading-spin';
        spin.style.animation = 'spin360 4s linear infinite';
        spin.style.fontSize = '5em';
        spin.style.position = 'fixed';
        spin.style.left = 'calc(50% - 25px)';
        spin.style.top = '30%';
        spin.style.width = '50px';
        spin.style.height = '50px';
        spin.style.lineHeight = '53px';
        spin.style.fontFamily = 'Courier New';
        spin.style.textAlign = 'center';
        document.body.insertBefore(panel, document.body.firstChild);
        document.body.insertBefore(spin, document.body.firstChild);

    }
    if (panel.shownCnt > 0) panel.shownCnt += visible ? 0 : -1;
    
    //_debug('from lib loading..' + visible + ', show count:' + panel.shownCnt +' at ' + new Date().getTime());
    if (panel.shownCnt === 0) {
        panel.spin.style.display = panel.style.display = visible ? 'inline-block' : 'none';
        if (visible) {
            panel.orgOverflow = document.body.style.overflow || 'initial';
            document.body.style.overflow = 'hidden';
        }
        else {
            if (panel.orgOverflow) {
                document.body.style.overflow = panel.orgOverflow;
                panel.orgOverflow = null;
            }
        }
    }
    panel.shownCnt += visible ? 1 : 0;
} as any;