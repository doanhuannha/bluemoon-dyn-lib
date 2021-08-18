import React, { ReactNode } from 'react'
import { BaseComponent } from '../BaseComponent';
import { DataPool } from '../DataPool';
import { Pager } from './Pager';
export interface TableConfig {
    columns: {
        headerLabel: string,
        dataField: string,
        component?: string,
        buildItem?: (dataItem: any, index: number) => any,
        htmlItem?: string
    }[],
    htmlProps?: any,
    pageSize?: number,
    pagingHandler?: (sender: BaseComponent, pageIndex: number, pageSize: number) => void,
    noItem?: string


}
export default class Table extends BaseComponent {
    renderComponent(): ReactNode {
        if (this.state.value == null) return null;
        const val = this.state.value;
        let config = window.utilities.merge(this.props.options, val.options) as TableConfig;


        let data = null as any[];
        let paging = null as { pageSize: number, pageIndex: number, totalRow: number };
        if (Array.isArray(val)) {
            data = val;
        }
        else {
            const ds = val as { data: any[], pageSize: number, pageIndex: number, totalRow: number };
            data = ds.data;
            if (data) paging = ds;
        }

        //const data = this.state.value as any[];
        const headerComponents = [];
        const dataComponents = [];
        for (let i = 0; i < config.columns.length; i++) {
            headerComponents.push(<th key={this.props.id + 'h' + i}>{config.columns[i].headerLabel}</th>);
        }
        if (data && data.length > 0) for (let j = 0; j < data.length; j++) {
            const td = [];
            for (let i = 0; i < config.columns.length; i++) {
                if (config.columns[i].component) {
                    let DynCom = DataPool.allControls[config.columns[i].component];
                    td.push(<td key={this.props.id + 'd' + j + '_' + i}><DynCom data={data[j]} parent={this.props.parent} tableInstance={this} dataIndex={j} /></td>);
                }
                else if (config.columns[i].buildItem) {
                    let item = config.columns[i].buildItem(data[j], j);
                    if (typeof (item) === 'string') td.push(<td key={this.props.id + 'd' + j + '_' + i} dangerouslySetInnerHTML={{ __html: item }}></td>);
                    else td.push(<td key={this.props.id + 'd' + j + '_' + i}>{item}</td>);
                }
                else if (config.columns[i].htmlItem) {
                    td.push(<td key={this.props.id + 'd' + j + '_' + i} dangerouslySetInnerHTML={{ __html: config.columns[i].htmlItem }}></td>);
                }
                else {
                    td.push(<td key={this.props.id + 'd' + j + '_' + i}>{data[j][config.columns[i].dataField]}</td>);
                }

            }
            dataComponents.push(<tr key={this.props.id + 'r' + j}>{td}</tr>);
        }
        else if (config.noItem) {
            let DynCom = DataPool.allControls[config.noItem];
            if (DynCom) dataComponents.push(<tr key={this.props.id + 'no_data'}><td><DynCom /></td></tr>);
            else dataComponents.push(<tr key={this.props.id + 'no_data'}><td><span dangerouslySetInnerHTML={{ __html: config.noItem }}></span></td></tr>);
        }
        else dataComponents.push(<tr key={this.props.id + 'no_data'}><td colSpan={config.columns.length}>No data to be displayed</td></tr>);

        return (<>
            <table id={this.props.id}  {...this.props.options?.htmlProps}>
                <thead>
                    <tr>{headerComponents}</tr>
                </thead>
                <tbody>
                    {dataComponents}
                </tbody>
            </table>
            {paging ? <Pager pageIndex={paging.pageIndex} pageSize={paging.pageSize} totalRow={paging.totalRow} pagingHandler={config?.pagingHandler} parent={this} /> : null}
        </>);
    }

}