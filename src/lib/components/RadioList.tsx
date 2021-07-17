import React, { ReactNode, ChangeEvent } from 'react';
import { BaseComponent } from '../BaseComponent';

export default class RadioList extends BaseComponent {
    private onChangedHandler(event: ChangeEvent<HTMLInputElement>): void {
        this.setValue(event.target.value);
    }
    protected renderComponent(): ReactNode {
        const items = [];
        const data = this.state.dataSource as any[];
        const txtField = this.props.options?.textField || 'text';
        const valField = this.props.options?.valueField || 'valueId';
        if (data != null) {
            if(this.state.readonly){
                for (let i = 0; i < data.length; i++) {
                    if(this.getValue() == data[i][valField]){
                        items.push(<span key={this.props.id + i}>{data[i][txtField]}</span>);
                        break;
                    }
                }
            }
            else{
                const group = 'rg' + this.props.id + Math.random();
                for (let i = 0; i < data.length; i++) {
                    let itemId = this.props.id + '_item' + i;
                    if(data[i][valField] || data[i][txtField]) items.push(<span key={this.props.id + i}><input type="radio" checked={this.getValue() == data[i][valField]} disabled={!this.state.enable} name={group} id={itemId} value={data[i][valField]} onChange={(event) => this.onChangedHandler(event)} />
                        <label htmlFor={itemId}>{data[i][txtField]}</label></span>);
                }
            }
            
        }
        return <span id={this.props.id} {...this.props.options?.htmlProps}>
            {this.props.label ? (<label>{this.props.label}</label>) : null}
            {items}
        </span>;

    }

}