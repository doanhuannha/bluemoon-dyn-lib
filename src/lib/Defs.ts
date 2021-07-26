import React from 'react';
export interface IComponent extends React.Component<IBaseComponentProps, IComponentState> {
    setValue(val: any, isDefault?: boolean): void,
    getValue(): any,
    setVisible(visible: boolean): void,
    setEnable(enable: boolean): void,
    setDataSource(data: any): void,
    reset(): void,
    isValid(): boolean
}

export interface IField extends React.Component<IComponentProps, IComponentState> {
}

export interface IView extends React.Component<IViewProps, IViewState> {
    dataApi: string,
    submitApi: string,
    find(name: string): IComponent | IField | null,
    extra: any
}

export interface IViewProps {
    name: string,
    visible?: boolean,
    dataSource?: any,
    id?: string,
    className?: string,
    dataApiParams?: ApiParamsFunction | object,
    onDataBound?: (sender: React.Component<IViewProps, IViewState>, fields: React.Component<IComponentProps, IComponentState>[]) => void;
    onDidUpdate?: (sender: React.Component<IViewProps, IViewState>) => void;
    layout?: {
        name: string,
        options?: any
    },
    linkingObjects?: { [name: string]: any },
    dataField?: string,
    options?: any,
    readonly?: boolean
};
export interface IViewState {
    visible: boolean
};
export type DidMountFunction = (sender: IComponent) => void;
export type ValidationFunction = (sender: IComponent, newVal: any, oldVal: any, context: IAppContext) => string;
export type ValueChangedFunction = (sender: IComponent, newVal: any, oldVal: any, context: IAppContext) => void;
export type BuildMessageFunction = (msg: string, sender: IComponent, newVal: any, oldVal: any, context: IAppContext) => any;
export type ApiParamsFunction = (sender: React.Component, url: string, context: IAppContext) => any;
export type SubmitParamsFunction = (sender: React.Component, submitData: any) => any;
export interface IComponentProps extends FieldDefine {
    id?: string,
    parent?: IView,
    readonly?: boolean
    //messageType?: string,
    //valueChangedFunc?: ValuaChangeFunction,
    //didMountFunction?: DidMountFunction
};

export interface IBaseComponentProps {
    id?: string,
    didMountFunction?: DidMountFunction,
    value?: any,
    defaultValue?: any,
    //dataField?: string,
    label?: string,
    validationFunc?: ValidationFunction,
    validationRules?: ValidatorRule[],
    //dataSourceApi?: string,
    //sourceField?: string,
    //dataApiParamsFunc?: ParamsFunction,
    dataSource?: any,
    options?: any,
    enable?: boolean,
    visible?: boolean,
    readonly?: boolean,
    valueChangedFunc?: ValueChangedFunction,
    parent?: any
};
export type FieldDefine = {
    type: string,
    dataField?: string,
    label?: string,
    validationFunc?: ValidationFunction,
    validationRules?: ValidatorRule[],
    dataSourceApi?: string,
    sourceField?: string,
    dataApiParamsFunc?: ApiParamsFunction,
    dataSource?: any,
    options?: any,
    enable?: boolean,
    visible?: boolean,
    valueChangedFunc?: ValueChangedFunction
}

export interface IComponentState {
    value: any,
    visible: boolean,
    enable: boolean,
    readonly: boolean,
    dataSource: any,
    valid: boolean
};


export interface IFieldItem {
    [key: string]: FieldDefine
}

export type ViewFieldDefine = {
    name: string,
    label?: string,
    dataField?: string,
    options?: any,
    validationRules?: ValidatorRule[],
    validationFunc?: ValidationFunction,
    valueChangeFunc?: ValueChangedFunction
};
export type ViewDefine = {
    fields: ViewFieldDefine[],
    templateUrl?: string,
    submitApi?: string,
    submitApiParamsFunc?: SubmitParamsFunction,
    dataApi?: string,
    dataApiParamsFunc?: ApiParamsFunction,
    deleteApi?: string,
    deleteApiParamsFunc?: SubmitParamsFunction,
    layout?: {
        name: string,
        options?: any
    },
    dataField?: string,
    options?: any
};
export interface IViewItem {
    [key: string]: ViewDefine
}


export interface KeyPair {
    [key: string]: any
}

export interface IAppContext {
    user: {
        id: string,
        name: string
    },
    extraData?: any

}
export const AppContext = React.createContext({} as IAppContext);
export const AppContextProvider = AppContext.Provider
export const AppContextConsumer = AppContext.Consumer




export type ValidatorRule = {
    rule: string,
    msg: string,
    options?: any
}
export interface RuleOption {
    msg: string,
    [name: string]: any
}
type ValidateRuleFunction = (n: string, o: string, opt: RuleOption) => string;
declare global {
    interface Window {
        validator: {
            validate(n: string, o: string, rules: ValidatorRule[], ctx: any): string,
            registerRule(r: string, f: (n: string, o: string, opt: RuleOption) => string): void,
            registeredRules: {
                [rulename: string]: ValidateRuleFunction
            }
        } & { [name: string]: any },
        utilities: {

            getHashParams(k: string): string,
            getQueryParams(k: string): string,
            loadJs(url: string, callback: (args?: any) => void, callbackArg?: any): void,
            resolveUrl(url: string): string,
            importFieldDefs(fields: IFieldItem): void,
            importViewDefs(views: IViewItem): void,
            loadView(possibleContainer: string | Element, viewProps: IViewProps): boolean,
            loadComp(possibleContainer: string | Element | null, comp: any, parameters: any): boolean,
            merge(target: any, ...sources: any[]): any,
            waitFor(check: (p?: any) => boolean, callback: (p?: any) => void, arg?: any): void,
            extractValue(val: any, field: string): any,
            setValue(obj: any, field: string, val: any): void,
            parseJSON(json: string): any,
            getDefault(val: any, defaultValue: any): any;
        } & { [name: string]: any },
        timer: {
            wait(callback: (p?: any) => void, ms?: number, arg?: any): number,
            cancel(id: number): void,
            oncancel: (id: number) => void
        } & { [name: string]: any },
        storage: {
            get: (name: string) => any,
            set: (name: string, value: any) => void
        },
        toggleLoadingPanel(visible: boolean): void,
        bluemoon: {
            reactjs: {
                staticViewDefs: any,
                staticFieldDefs: any
            }
        }
    }
}

