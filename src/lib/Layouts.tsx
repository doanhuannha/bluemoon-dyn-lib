import React from "react";
import { AppContextProvider } from "./Defs";

export class HtmlLayout extends React.Component<{ className?: string }> {
    public render() {
        let div = [] as any;
        const className = 'flow' + (this.props.className ? ' ' + this.props.className : '');
        React.Children.map(this.props.children, (e, i) => {
            div.push(<div key={'item-' + i} className={className}><AppContextProvider value={this.context}>{e}</AppContextProvider></div>);
        });
        return <>{div}</>;
    }
}
export class FlowLayout extends React.Component<{ className?: string }> {
    public render() {
        let div = [] as any;
        const className = 'flow' + (this.props.className ? ' ' + this.props.className : '');
        React.Children.map(this.props.children, (e, i) => {
            div.push(<div key={'item-' + i} className={className}><AppContextProvider value={this.context}>{e}</AppContextProvider></div>);
        });
        return <>{div}</>;
    }
}


export class GridLayout extends React.Component<{ columns: number, rowClassName?: string, colClassName?: string }>{
    public render() {
        let divRow = [] as any[];
        let colCnt = 0, rowCnt = 0;
        let divCol = [] as any[];
        const colClass = 'grid-col' + (this.props.colClassName ? ' ' + this.props.colClassName : '');
        const rowClass = 'grid-row' + (this.props.rowClassName ? ' ' + this.props.rowClassName : '');
        React.Children.map(this.props.children, (e) => {
            colCnt++;
            divCol.push(<div key={'col-' + colCnt} className={colClass}><AppContextProvider value={this.context}>{e}</AppContextProvider></div>);
            if (colCnt == this.props.columns) {
                colCnt = 0;
                rowCnt++;
                divRow.push(<div key={'row-' + rowCnt} className={rowClass}>{divCol}</div>);
                divCol = [];
            }
        });

        if (divCol.length > 0) {
            colCnt = 0;
            rowCnt++;
            divRow.push(<div key={'row-' + rowCnt} className={rowClass}>{divCol}</div>);
        }
        return <>{divRow}</>;
    }
}
