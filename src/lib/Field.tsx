import React, { RefObject } from 'react';
import { BaseComponent } from './BaseComponent';
import { DataPool } from './DataPool';
import { IComponentProps as IFieldProps, IComponentState, IField, AppContext } from './Defs';
import { _debug } from './Utilities.debug';
import { execApiAsync } from './Utilities.execApi';


export class Field extends React.Component<IFieldProps & { [name: string]: any }, IComponentState> implements IField {
    static contextType = AppContext;
    public control: RefObject<BaseComponent>;
    private delayValue = null as any;
    constructor(props: IFieldProps & { [name: string]: any }) {
        super(props);
        this.control = React.createRef();
    }
    render() {
        let name = this.props.type;
        const Control = DataPool.allControls[name];
        if (Control == null) {
            return <div>Can not find control (component) "{name}"</div>;
        }
        else return <Control key={this.props.id} ref={this.control} {...this.props} />;
    }
    public rebind(url: string = null, postData: any = undefined) { //bind data source for the component
        if (this.control.current == null) return;
        url = url || this.props.dataSourceApi;
        if (url) {

            if (this.props.dataApiParamsFunc) {
                if (postData == undefined) postData = this.props.dataApiParamsFunc(this.control.current, url, this.context);
                else postData = window.utilities.merge(this.props.dataApiParamsFunc(this.control.current, url, this.context), postData);
            }
            execApiAsync(url, postData).then(response => response.json()).then(data => {
                this.control.current.setDataSource(data);
                if (this.delayValue) {
                    this.control.current.setValue(this.delayValue.value, this.delayValue.isDefault);
                    this.delayValue = null;
                }
            }).catch(error => {
                _debug('error on request: ' + url);
                _debug(error);

            });
        }
    }
    componentDidMount() {
        if (this.control.current == null) return;
        if (this.control.current.getDataSource() == null) this.rebind();
    }

    public bindValue(val: any, isDefault: boolean): boolean {
        if (this.control.current == null) return false;
        let value = undefined;
        if (this.props.sourceField) value = window.utilities.extractValue(val, this.props.sourceField);
        if (value != undefined) this.control.current.setDataSource(value);
        value = undefined;
        if (this.props.dataField) value = window.utilities.extractValue(val, this.props.dataField);
        if (value != undefined) {
            if (this.props.dataSourceApi && this.control.current.getDataSource() == null) {
                //should not bind value now
                this.delayValue = { value, isDefault };

            }
            else {
                this.control.current.setValue(value, isDefault);
            }

        }

        return true;
    }
}
