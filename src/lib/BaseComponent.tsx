import React, { ReactNode } from 'react';
import { IComponentState, IComponent, AppContext, IAppContext, IBaseComponentProps } from './Defs';
import { DynConfig } from './DynConfig';
import { View } from './View';


export abstract class BaseComponent extends React.Component<IBaseComponentProps & {[name:string]: any}, IComponentState & {[name:string]: any}> implements IComponent {
    static contextType = AppContext;
    defaultValue: any;
    customMessageObject: any;

    constructor(props: IBaseComponentProps & {[name:string]: any}) {
        super(props);
        this.state = {
            value: props?.value == undefined ? null : props.value,
            displayValue: props?.displayValue == undefined ? null : props.displayValue,
            visible: props?.visible == null ? true : props.visible,
            enable: props?.enable == null ? true : props.enable,
            dataSource: props?.dataSource || null,
            readonly: props?.readonly == null ? false : props.readonly,
            valid: true
        };
        this.defaultValue = props?.defaultValue;
        
    }
	public getDataSource() {
        return this.state.dataSource;
    }
    public setDataSource(data: any) {
        this.setState({ dataSource: data });
    }
    public setValue(val: any, isDefault?: boolean): void {
        if (isDefault) this.defaultValue = val;
        this.setState({ value: val });
    }
    public getValue(): any {
        return this.state.value == null ? this.defaultValue || this.state.value : this.state.value;
    }
    public setDisplayValue(val: any): void {
        this.setState({ displayValue: val });
    }
    public getDisplayValue(): any {
        return this.state.displayValue;
    }
    public setVisible(visible: boolean): void {
        this.setState({ visible: visible });
    }
    public setEnable(enable: boolean): void {
        this.setState({ enable: enable });
    }
    public setReadonly(readonly: boolean): void {
        this.setState({ readonly: readonly });
    }
    public isValid(): boolean {
        let val = this.state.value;
        let msg = this.validateData(val, val, this.context);
        this.showHideMessage(msg, val, val, this.context);
        return msg == null;
    }
    public shouldComponentUpdate(nextProps: Readonly<IBaseComponentProps>, nextState: Readonly<IComponentState>, nextCtx: any) {

        if (this.state.value !== nextState.value) {
            let msg = this.validateData(nextState.value, this.state.value, this.context);
            this.showHideMessage(msg, nextState.value, this.state.value, this.context);
        }
        return true;

    }
    private validateData(n: any, o: any, c: IAppContext): string {
        let errMsg = null;
        if (this.props.validationFunc) errMsg = this.props.validationFunc(this, n, o, this.context);
        if (!errMsg && this.props.validationRules) errMsg = window.validator.validate(n, o, this.props.validationRules, this.context);
        return errMsg;
    }
    public componentDidUpdate(prevProps: Readonly<IBaseComponentProps>, prevState: Readonly<IComponentState>, snapshot?: any): void {
        if (this.props.valueChangedFunc && this.state.value !== prevState.value) {
            this.props.valueChangedFunc(this, this.state.value, prevState.value, this.context);

        }
    }
    public componentDidMount() {
        if (this.props.didMountFunction) this.props.didMountFunction(this);
    }
    public render(): React.ReactNode {

        if (this.state.visible) return (<>
            {this.renderComponent()}
            {this.customMessageObject}
        </>);
        else return null;
    }
    public getView(): View{
        return this.props.parent;
    }
    private showHideMessage(msg: string, newVal: any, oldVal: any, ctx: IAppContext): void {
        this.customMessageObject = null;
        if (msg) {
            if (DynConfig.customValidationMessage) {
                this.customMessageObject = DynConfig.customValidationMessage(msg, this, newVal, oldVal, ctx);
            }
            else alert(msg);
            if (this.state.valid) this.setState({ valid: false });
        }
        else {
            if (!this.state.valid) this.setState({ valid: true });
        }

    }
    public reset(): void {
        this.setValue(this.defaultValue);
    }
    protected abstract renderComponent(): ReactNode;

}