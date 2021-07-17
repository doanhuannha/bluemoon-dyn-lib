import React, { ReactNode } from 'react'
import { BaseComponent } from '../BaseComponent';
import { DataPool } from '../DataPool';
import { Pager } from './Pager';
export interface DataListConfig {
    component?: any,
    buildItem?: (dataItem: any, index: number) => any
    htmlProps?: any,
    pagingHandler?: (sender: BaseComponent, pageIndex: number, pageSize: number) => void
    noItem?: string

}

export default class DataList extends BaseComponent {
    bindData = function(s: string, data: any) {
        s = s.replace(/{(\w+)}/ig, (m: any, g: any)=>{
            return escape(data[g]);
        });
        return s;
    };
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
                    const html = this.bindData(item, data[j]);
                    //dataComponents.push(<>{this.bindData(item, data[j])}</>);
                    dataComponents.push(<div key={itemKey} dangerouslySetInnerHTML={{ __html: html }}></div>);
                }
                else dataComponents.push(<div key={itemKey}>{item}</div>);
            }
            else {
                dataComponents.push(<div key={itemKey}>{data[j]}</div>);
            }
        }
        else if (config.noItem) {
            let DynCom = DataPool.allControls[config.noItem];
            if (DynCom) dataComponents.push(<><DynCom key={this.props.id + 'no_data'} /></>);
            else dataComponents.push(<span key={this.props.id + 'no_data'} dangerouslySetInnerHTML={{ __html: config.noItem }}></span>);

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
