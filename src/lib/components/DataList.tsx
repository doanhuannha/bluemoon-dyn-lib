import React, { ReactNode } from 'react'
import { BaseComponent } from '../BaseComponent';
import { DataPool } from '../DataPool';
import HtmlTemplate from './HtmlTemplate';
import { Pager } from './Pager';
export interface DataListConfig {
    component?: any,
    buildItem?: (dataItem: any, index: number) => any
    htmlProps?: any,
    pagingHandler?: (sender: BaseComponent, pageIndex: number, pageSize: number) => void
    noItem?: string,
    htmlItem?: string 

}

export default class DataList extends BaseComponent {
    renderComponent(): ReactNode {

        const config = this.props.options as DataListConfig;
        let data = null as any[];
        let paging = null as { pageSize: number, pageIndex: number, totalRow: number };
        const val = this.state.value;
        if (this.state.value != null) {
            if (Array.isArray(val)) {
                data = val;
            }
            else {
                const ds = val as { data: any[], pageSize: number, pageIndex: number, totalRow: number };
                data = ds.data;
                paging = ds;
            }
        }


        let dataComponents = [];
        if (data && data.length > 0) for (let j = 0; j < data.length; j++) {
            let itemKey = this.props.id + 'd' + j + JSON.stringify(data);
            const component = config?.component;
            if (component) {
                let DynCom = DataPool.allControls[component];
                dataComponents.push(<DynCom key={itemKey} data={data[j]} parent={this.props.parent} dataListInstance={this} dataIndex={j} />);
            }
            else if (config?.buildItem) {
                let item = config.buildItem(data[j], j);
                if (typeof (item) == 'string') {
                    dataComponents.push(<HtmlTemplate key={itemKey} options={{html: item}} value={data[j]} />);
                }
                else dataComponents.push(<div key={itemKey}>{item}</div>);
            }
            else if (config?.htmlItem) {
                dataComponents.push(<HtmlTemplate key={itemKey} options={{html: config.htmlItem}} value={data[j]} />);
            }
            else {
                dataComponents.push(<div key={itemKey}>{data[j]}</div>);
            }
        }
        else if (config.noItem) {
            let DynCom = DataPool.allControls[config.noItem];
            if (DynCom) dataComponents.push(<><DynCom key={this.props.id + 'no_data'} /></>);
            else dataComponents.push(<HtmlTemplate options={{ html: config.noItem }}/>);

        }
        else dataComponents.push(<div key={this.props.id + 'no_data'}>No data found</div>);


        return (<>
            <div id={this.props.id} {...this.props.options?.htmlProps}>
                {dataComponents}
            </div>
            {paging ? <><Pager pageIndex={paging.pageIndex} pageSize={paging.pageSize} totalRow={paging.totalRow} pagingHandler={config?.pagingHandler} parent={this} /></> : null}

        </>);
    }

}
