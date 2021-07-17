import React from 'react';
import { DynConfig } from './DynConfig';
import { DataPool } from './DataPool';
import { View } from './View';

export class ConfigLoader extends React.Component<ConfigLoaderProps, ConfigLoaderState> {
    private loaded: boolean = false;
    constructor(props: ConfigLoaderProps) {
        super(props);
        this.loaded = false;//change to true if not load on runtime
    }

    private loadThenNext(urls: string[], index: number, callback: () => void): void {
        var me = this;
        window.utilities.loadJs(urls[index], function () {
            if (urls[++index]) me.loadThenNext(urls, index, callback);
            else callback();
        });
    }
    private parseAttibutes(atts: NamedNodeMap): any {
        const ret = {};
        for (let i = 0; i < atts.length; i++) {
            if(atts[i].name=='class'){
                console.log('class='+atts[i].value);
                ret['className'] = atts[i].value;
            }
            else ret[atts[i].name] = atts[i].value;
            
        }
        return ret;
    }
    private htmlDecode(s: string): string {
        var el = document.createElement('textarea');
        el.innerHTML = s;
        return el.value;
    };
    private loadComponent() {
        let containers = document.body.querySelectorAll('[role="react-loader"]');
        let Page = null;
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            let viewName = container.getAttribute('data-view');

            if (!viewName) Page = DataPool.allPages[container.getAttribute('data-page')];
            if (!Page) Page = () => (<div>Cannot find the page name: {container.getAttribute('data-page')}</div>);
            DynConfig.appDOM.render(
                viewName ? <View id={'vv' + i} key={'k' + i} name={viewName}  {...this.parseAttibutes(container.attributes)} {...{ innerData: this.htmlDecode(container.innerHTML) }} /> : <Page id={"pp" + i} key={'k' + i} {...this.parseAttibutes(container.attributes)} {...{ innerData: this.htmlDecode(container.innerHTML) }} />, container);
        }
    }
    componentDidMount() {
        //if(this.loaded) return;
        let me = this;
        let index = 0;
        let urls = this.props.fieldUrls.concat(this.props.viewUrls);
        this.loadThenNext(urls, index, function () {
            me.loaded = true;
            me.forceUpdate();
            if (me.props.callback) me.props.callback();
            me.loadComponent();


        });

    }
    render() {
        if (this.loaded && this.props.children) {
            return this.props.children;
        }
        else return null;

    }

}
type ConfigLoaderProps = {
    fieldUrls: string[],
    viewUrls: string[],
    callback?: () => void;
}
type ConfigLoaderState = {}
