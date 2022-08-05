import React, { RefObject } from 'react'
import { DataPool } from './DataPool';
import { ViewFieldDefine, ViewDefine, IViewProps, IViewState, IView, IComponent, AppContext, AppContextProvider, SubmitParamsFunction, IFieldItem, IComponentProps } from './Defs';
import { DynConfig } from './DynConfig';
import { Field } from './Field';
import { _debug } from './Utilities.debug';
import { execApiAsync } from './Utilities.execApi';


export class View extends React.Component<IViewProps, IViewState> implements IView {
    private fields: ViewFieldDefine[];
    private children: RefObject<Field>[];
    private viewDef: ViewDefine;
    private dataSource: any;
    private dataApiParams: any;
    private submitApiParams: SubmitParamsFunction;
    private deleteApiParams: SubmitParamsFunction;
    private templateLayout: ITemplateLayout;
    private layout: {
        name: string,
        options?: {
            templateUrl?: string,
            htmlTemplate?: string
        } & { [name: string]: any }
    }
    private dataField: string;
    public container: Element;
    public static contextType = AppContext;
    public dataApi: string;
    public submitApi: string;
    public deleteApi: string;
    public extra: any;
    constructor(props: IViewProps) {
        super(props);
        this.dataSource = props.dataSource;
        this.state = { visible: props.visible == null ? true : props.visible };
        this.children = [];
        this.extra = {};
        this.init(props);
    }

    private init(props: IViewProps) {
        if (DataPool.allViews[props.name] != null) {
            this.initView(DataPool.allViews[props.name]);
        }
        else {
            _debug('Can not find view: ' + props.name + '. Try to load from server at settings/' + props.name + '.js');
            window.utilities.loadJs('settings/' + props.name + '.js', (view: View) => {
                if (DataPool.allViews[view.props.name]) {
                    view.initView(DataPool.allViews[view.props.name]);
                    view.forceUpdate(() => {
                        view.componentDidMount();
                    });
                }
                else {
                    _debug('Finally, can not load view: ' + view.props.name);
                }

            }, this);
        }
    }
    private processViewInherit(viewDef: ViewDefine): ViewDefine {
        if (viewDef.inherit && DataPool.allViews[viewDef.inherit]) {
            viewDef = window.utilities.merge({}, this.processViewInherit(DataPool.allViews[viewDef.inherit]), viewDef);
        }
        return viewDef;
    }
    
    private initView(viewDef: ViewDefine) {
        this.viewDef = this.processViewInherit(viewDef);
        this.dataApi = this.viewDef.dataApi;
        this.dataApiParams = this.props.dataApiParams || this.viewDef.dataApiParamsFunc;
        this.submitApi = this.viewDef.submitApi;
        this.submitApiParams = this.viewDef.submitApiParamsFunc;
        this.deleteApi = this.viewDef.deleteApi;
        this.deleteApiParams = this.viewDef.deleteApiParamsFunc;

        this.layout = this.props.layout || this.viewDef.layout;
        this.dataField = this.props.dataField || this.viewDef.dataField;
        this.fields = this.viewDef.fields;
        if (this.fields) for (let i = 0; i < this.fields.length; i++) {
            this.children[i] = React.createRef();
        }
        if (this.layout?.name == 'htmllayout') {
            const opts = this.layout?.options;

            if (opts.templateUrl) {
                this.templateLayout = {
                    template: opts.templateUrl,
                    status: 'init',
                    html: null
                }
            }
            else if (opts.htmlTemplate) {
                this.templateLayout = {
                    template: 'html',
                    status: 'init',
                    html: opts.htmlTemplate
                }
            }

        }
        else if (this.props.children) {
            this.templateLayout = {
                template: 'inline-template',
                status: 'init',
                html: null
            }
        }

    }
    public componentDidUpdate() {
        if (this.props.onDidUpdate) this.props.onDidUpdate(this);
    }
    /*
    public componentDidUpdate() {
        if (this.layout && this.layout.status === 'ready') {//layout mode: bind data when layout is ready
            if (this.layout.dataReady === false) {
                this.componentDidMount();
                this.layout.dataReady = true;
            }
        }
    }
    */
    private findField(name: string, val: string): HTMLElement {
        let p = document.querySelector('[' + name + '="' + val + '"]');
        if (p) return p as HTMLElement;
        else return null;
    }
    public getData(): any {
        return this.dataSource;
    }
    public bindData(data: any, setDefault?: boolean) {
        if (setDefault == null) setDefault = false;
        this.dataSource = data;
        let fields = [] as Field[];
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].current) {
                fields.push(this.children[i].current);
                this.children[i].current.bindValue(data, setDefault);
            }
        }
        if (fields.length > 0 && this.props.onDataBound) this.props.onDataBound(this, fields);
    }
    public rebind(url?: string) {
        if (!url) url = this.dataApi;
        let postData = null;
        if (this.dataApiParams) {
            if (this.dataApiParams instanceof Function) postData = this.dataApiParams(this, url, this.context);
            else postData = this.dataApiParams;
        }
        
        execApiAsync(url, postData).then(response => response.json()).then(data => {
            if (data != null) this.bindData(this.dataField ? window.utilities.extractValue(data, this.dataField) : data, false);
            else _debug('dataApi return null: '+ url);
        }).catch(error => {
            _debug('error on request: ' + url);
            _debug(error);
        });
    }
    public componentDidMount() {
        if (this.templateLayout && this.templateLayout.status !== 'ready') {
            if (this.templateLayout.template === 'inline-template') {

                //render items
                const items = this.buildFields();
                let cnt = 0;
                items.forEach(e => {
                    let panel = this.findField('field-name', e.props.name);
                    if (panel != null) {
                        cnt++;
                        DynConfig.appDOM.render(<AppContextProvider value={this.context}>{e}</AppContextProvider>, panel, () => {
                            cnt--;
                            if (cnt == 0) {
                                this.componentDidMount();
                            }
                        });
                    }
                });
                this.templateLayout.status = 'ready';
            }
            return;//layout mode: prevent binding data while layout is not ready
        }
        if (this.props.dataSource) this.bindData(this.dataField ? window.utilities.extractValue(this.props.dataSource, this.dataField) : this.props.dataSource, true);
        else if (this.dataApi) {
            this.rebind(this.dataApi);
        }
        this.container = DynConfig.appDOM.findDOMNode(this)?.parentNode as Element;
    }
    public toggleFields(n: any, options: [{ match: (v: any) => boolean, fields: AppliedField[] }]) {
        options.map(o => {
            if (o.match(n) === true) {
                o.fields.map(f => {
                    f.names.map(name => {
                        let field = this.find(name, true) as Field;
                        if (field) f.action(field, field.control.current, n);
                    });
                });
            }
            else {
                o.fields.map(f => {
                    f.names.map(name => {
                        let field = this.find(name, true) as Field;
                        if (field && f.reverseAction) f.reverseAction(field, field.control.current, n);
                    });
                });
            }

        });
    }
    public find(name: string, field?: boolean) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].current?.props.id === this.props.id + name + i)
                if (field) return this.children[i].current;
                else return this.children[i].current.control.current;
        }
        return null;//can not find the child with this name
    }
    public setReadonly(readonly: boolean) {
        for (let i = 0; i < this.children.length; i++) {
            var child = this.children[i].current;
            if (child && child.control.current) {
                child.control.current.setReadonly(readonly);
            }
        }
    }
    public getValues(): any {
        let values = {};
        for (let i = 0; i < this.children.length; i++) {
            var child = this.children[i].current;

            if (child && child.props.dataField && child.control.current) {
                window.utilities.setValue(values, child.props.dataField, child.control.current.getValue());
            }
        }
        if (this.dataField) {
            let newValues = {};
            newValues[this.dataField] = values;
            return newValues;
        }
        else return values;
    }
    public isValidData(): boolean {
        for (let i = 0; i < this.children.length; i++) {
            var child = this.children[i].current;
            if (child && child.control.current && !child.control.current.isValid()) return false;
        }
        return true;
    }
    public deleteData(): Promise<Response> {
        return this.submitDataToApi(this.deleteApi, this.deleteApiParams);
    }
    public submitData(): Promise<Response> {
        if (!this.isValidData()) {
            _debug('Invalid data to submit');
            return null;
        }
        return this.submitDataToApi(this.submitApi, this.submitApiParams);
    }
    private submitDataToApi(url: string, paramsFunc: SubmitParamsFunction): Promise<Response> {
        let submitData = this.getValues();
        if (paramsFunc) {
            submitData = paramsFunc(this, submitData);
        }
        return execApiAsync(url, submitData);
    }
    private processFieldInherit(fieldDef: IComponentProps): IComponentProps {
        if (fieldDef.inherit && DataPool.allFields[fieldDef.inherit]) {
            fieldDef = window.utilities.merge({}, this.processFieldInherit(DataPool.allFields[fieldDef.inherit]), fieldDef);
        }
        
        return fieldDef;
    }
    private buildFields(): any[] {
        const items = [];
        if (this.fields != null && this.fields.length > 0) {
            for (let i = 0; i < this.fields.length; i++) {
                if (DataPool.allFields[this.fields[i].name]) {
                    //field Props
                    //_debug('field:'+this.fields[i].name);
                    //_debug(DataPool.allFields[this.fields[i].name]);
                    //_debug('view redefined');
                    //_debug(this.fields[i]);
                    //const fieldProps = this.processFieldInherit(DataPool.allFields[this.fields[i].name]) as IComponentProps;
                    const fieldProps = {} as IComponentProps;
                    
                    
                    //window.utilities.merge(DataPool.allFields[this.fields[i].name], this.fields[i]);
                    window.utilities.merge(fieldProps, this.processFieldInherit(DataPool.allFields[this.fields[i].name]), this.fields[i]);
                    //_debug('overwritten');
                    //_debug(fieldProps);
                    items.push(<Field ref={this.children[i]}
                        parent={this}
                        //{...DataPool.allFields[this.fields[i].name]}
                        //{...this.fields[i]} //overwrite properties as label,...
                        key={this.props.id + this.fields[i].name + i}
                        id={this.props.id + this.fields[i].name + i}
                        readonly={this.props.readonly == null ? false : this.props.readonly}
                        {...fieldProps}
                    />
                    );
                }
                else {
                    items.push(<div key={this.props.id + this.fields[i].name + i}>Field "{this.fields[i].name}" should be here</div>);
                    _debug('Can not load field name: ' + this.fields[i].name);
                }

            }

        }
        return items;
    }
    public render() {
        if (!this.viewDef) return <div>Can not find view "{this.props.name}"</div>;
        else if (this.templateLayout) {
            if (this.templateLayout.status === 'init') {
                if (this.templateLayout.template === 'inline-template') {
                    this.templateLayout.status = 'rendering';
                    return <>{this.props.children}</>
                }
                else {

                    this.loadLayoutTemplate();
                    return null;

                }
            }
            else { //only with this.layout.template !== 'inline-template'
                const items = this.buildFields();

                return <TemplateLayoutLoader onComponentDidUpdate={() => { this.templateLayout.status = 'ready'; this.componentDidMount() }} id={this.props.id} key={this.props.id} className={this.props.className} content={this.templateLayout.html} items={items} children={this.children} visible={this.state.visible} />
            }
        }
        else {
            const items = this.buildFields();
            if (this.state.visible) {
                if (this.layout) {
                    const Layout = DataPool.allLayouts[this.layout.name];
                    return <Layout {...this.layout.options} view={this}>{items}</Layout>
                }
                else return <>{items}</>;
            }
            else return null;

        }

    }
    private loadLayoutTemplate() {

        if (this.templateLayout.html) {
            this.templateLayout.status = 'loaded';
            new Promise(r => r(null)).then(() => {
                this.forceUpdate();
            });

        }
        else {
            this.templateLayout.status = 'loading';
            execApiAsync(window.utilities.resolveUrl(this.templateLayout.template), null, false)
                .then(response => response.text())
                .then(text => {
                    this.templateLayout.html = text;
                    this.templateLayout.status = 'loaded';
                    this.forceUpdate();
                }).catch(error => {
                    _debug('error on request:' + this.templateLayout.template);
                    _debug(error);
                });
            /*
            fetch(window.utilities.resolveUrl(this.templateLayout.template))
                .then(response => response.text())
                .then(text => {
                    this.templateLayout.html = text;
                    this.templateLayout.status = 'loaded';
                    this.forceUpdate();
                }).catch(error => {
                    _debug('error on request:' + this.templateLayout.template);
                    _debug(error);
                });
            */
        }

    }

}
type AppliedField = { names: string[], action: FieldAction, reverseAction?: FieldAction };
type FieldAction = (ctrl: Field, f: IComponent, v: any) => void;
type TplLayoutProps = {
    content: string,
    items: any[],
    visible: boolean,
    id: string,
    className: string,
    onComponentDidUpdate: () => void;
}
class TemplateLayoutLoader extends React.Component<TplLayoutProps>{
    public static contextType = AppContext;
    //private children: RefObject<Field>[] = [];
    private container: RefObject<HTMLDivElement>;
    constructor(props: TplLayoutProps) {
        super(props);

        this.container = React.createRef();
    }
    public componentDidUpdate() {
        this.props.onComponentDidUpdate();
    }
    public componentDidMount() {
        this.props.items.forEach((e) => {
            let panel = this.container.current.querySelector('[field-name="' + e.props.name + '"]');
            if (panel) DynConfig.appDOM.render(<AppContextProvider value={this.context}>{e}</AppContextProvider>, panel);
        });
        this.forceUpdate();//call this to raise didUpdate event and render current state of this component
    }
    public render() {
        //never add dynamic attribute key here
        return <div ref={this.container} id={this.props.id} className={this.props.className} dangerouslySetInnerHTML={{ __html: this.props.content }} ></div>
    }
}
interface ITemplateLayout {
    template: string,
    status: string,
    html: string
}
