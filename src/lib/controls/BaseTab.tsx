import React from 'react';
export type TabDS = { [name: string]: TabItem };
type TabAtts = {
    dataSource: TabDS,
    primary?: boolean,
    activeTab?: string,
};
type TabState = {
    dataSource: TabDS,
    activeTab: string,
};
type TabItem = {
    title: string,
    content: JSX.Element,
    icon?: string,
    closable?: boolean,
}
export type TabRef = {
    instance: BaseTab
};
export abstract class BaseTab extends React.Component<TabAtts, TabState> {
    closedTab = {} as { [key: string]: (sender: BaseTab) => void };
    constructor(props: TabAtts) {
        super(props);
        let activeTab = this.props.activeTab;
        if (!activeTab) {
            for (const tabName in this.props.dataSource) {
                activeTab = tabName; break;
            }
        }
        this.state = {
            dataSource: this.props.dataSource,
            activeTab: activeTab,
        };
        //assign tab ref
        for (const tabName in this.props.dataSource) {
            let pp = this.props.dataSource[tabName].content.props;
            let tabRef = pp.tabRef as TabRef;
            if (tabRef && !tabRef.instance) tabRef.instance = this;
        }
    }
    updateHeadTitle(name: string, title: string): boolean {
        const tabItem = this.getHeadRef(name);
        if (tabItem) {
            tabItem.innerHTML = title;
            return true;
        }
        return false;
    }
    public addTab(tabName: string, tabDetail: TabItem, onclosedTab?: (sender: BaseTab) => void) {
        const ds = this.state.dataSource || {};
        if (ds[tabName] == null) ds[tabName] = tabDetail;
        let pp = tabDetail.content.props;
        let tabRef = pp.tabRef as TabRef;
        if (tabRef && !tabRef.instance) tabRef.instance = this;
        this.setState({ activeTab: tabName });
        setTimeout((tab: BaseTab) => {
            let el = tab.getHeadRef(tabName);
            var pos = el.getBoundingClientRect();
            if (pos.top < 0 || pos.top > window.innerHeight) el.scrollIntoView({ behavior: 'smooth' });
        }, 100, this);
        if(onclosedTab){
            this.closedTab[tabName] = onclosedTab;
        }
    }
    protected navigateTo(tabName: string) {
        this.setState({ activeTab: tabName });
    }
    public closeTab(tabName: string) {
        const ds = this.state.dataSource || {};
        if (tabName === this.state.activeTab) {
            let targetTab = null;

            for (const tabName in ds) {
                if (tabName === this.state.activeTab) continue;
                else targetTab = tabName;
            }
            delete ds[tabName];

            this.navigateTo(targetTab);
        }
        else {
            let targetTab = this.state.activeTab;
            delete ds[tabName];
            this.navigateTo(targetTab);
        }
        if (this.closedTab[tabName]) this.closedTab[tabName](this);

    }
    protected abstract renderHead(name: string, tab: TabItem, active: boolean): JSX.Element;
    protected abstract renderContent(name: string, tab: TabItem, active: boolean): JSX.Element;
    protected abstract renderTab(heads: JSX.Element[], contents: JSX.Element[]): React.ReactNode;
    protected abstract getHeadRef(name: string): HTMLElement;
    render() {
        const heads = [] as JSX.Element[];
        const contents = [] as JSX.Element[];
        const ds = this.state.dataSource || {};
        for (let tabName in ds) {
            const tab = ds[tabName];
            if (tab == null) continue;
            let active = tabName === this.state.activeTab;
            heads.push(this.renderHead(tabName, tab, active));
            contents.push(this.renderContent(tabName, tab, active));
        }
        return this.renderTab(heads, contents);
    }
}
export class BootstrapTab extends BaseTab {

    private _headRefs: { [name: string]: React.RefObject<HTMLAnchorElement> } = {};
    protected getHeadRef(name: string): HTMLElement {
        return this._headRefs[name].current;
    }
    protected renderTab(heads: JSX.Element[], contents: JSX.Element[]): React.ReactNode {
        return <div>
            <ul className={this.props.primary ? "nav nav-tabs" : "nav nav-pills"}>
                {heads}
            </ul>
            <div className="tab-contents">{contents}</div>
        </div>
    }
    protected renderHead(name: string, tab: TabItem, active: boolean): JSX.Element {
        this._headRefs[name] = React.createRef();
        return <li className="nav-item" key={'tab' + name} onClick={active ? null : () => { this.navigateTo(name); }}>
            <a ref={this._headRefs[name]} className={active ? 'nav-link active' : 'nav-link'} href="#" onClick={evt => { evt.preventDefault(); }}>{tab.title || '[Untitled]'}</a>
            {tab.closable ? <span onClick={evt => { this.closeTab(name); evt.stopPropagation(); }}>X</span> : null}
        </li>;
    }
    protected renderContent(name: string, tab: TabItem, active: boolean): JSX.Element {
        return (active ?
            <div key={'content' + name} style={{ display: 'block' }}>{tab.content}</div> :
            <div key={'content' + name} style={{ visibility: 'hidden', position: 'absolute' }}>{tab.content}</div>);
    }
}