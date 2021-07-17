# bluemoon-dyn-lib

> Dynamic views

[![NPM](https://img.shields.io/npm/v/dyn-lib.svg)](https://www.npmjs.com/package/dyn-lib) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save bluemoon-dyn-lib
```

## Usage
Define controls

DropdownList.tsx
``` tsx
import React, { ReactNode, ChangeEvent } from 'react';
import * as Dyn from 'bluemoon-dyn-lib';
export class DropdownList extends Dyn.BaseComponent{
    private onChangedHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        const updatedVal = event.target.value;
        this.setState({value:updatedVal});
    }
    protected renderComponent(): ReactNode {
        const items = [];
        items.push(<option key={this.props.id+'i'} value="">[{this.props.label}]</option>);
        const data = this.state.dataSource;
        
        if(data!=null){
            for(let i=0;i<data.length;i++){
                items.push(<option key={this.props.id+i} value={data[i].value}>{data[i].text}</option>);
            }
        }
        
        return  <div className="form-group">
            <select className="form-control" id={this.props.id} value={this.state.value || ''} disabled={!this.state.enable} onChange={(event)=>this.onChangedHandler(event)}>
            {items} 
            </select>
        </div>
        
    }
    
}
...
...
//export to be used when defining fields
DynConfig.exportControls({
    'textbox': TextBox,
    'label': Label,
    'dropdownlist': DropdownList,
    'table': Table,
    'addmore': AddMore,
    'combobox': ComboBox,
    'searchbutton': SearchButton,
    'searchtextbox': SearchTextbox,
    'searchresultlist': SearchResultList
});

```
Define the fields as fields.js
```js

window.utilities.importFieldDefs({
    'ctrl001': {
        name: 'ctrl001',
        label: 'Client Name',
        type: 'dropdownlist',
        validationFunc: function(s, n, o){
           if(n==='0') return 'Please select a client';
           else return null;
        },
        dataField: 'clientID',
        dataSourceApi: '/mock/clients.json',
        //this is for demo of post data
        //*
        getApiParams: function(s,u,c){
            console.log('context in field to get params');
            console.log(c);
            return null;
        }
        //*/
    },
    'ctrl002':{
        name: 'ctrl002',
        label: 'User Name',
        type: 'textbox',
        validationFunc: function(s, n, o){
            if(n===''){
                return 'User Name: required';
            }
            else{
                if(!n.match(/^[A-Za-z]+$/)){
                    return 'Only alphabet characters';
                }
            }
            return null;
        },
        dataField: 'userName'
    },
    'ctrl003':{
        name: 'ctrl003',
        label: 'Welcome',
        type: 'label',
        dataField: 'displayName'
    },
    ....
});

```
Define the views as views.js
```js
window.utilities.importViewDefs({
    'view1':{
        name: 'view1',
        dataApi: 'mock/data.json',
        submitApi: 'submit',
        template: 'settings/layout1.htm',
        //this is for demo of post data
        //*
        getApiParams: function(s,url,ctx){
            console.log('context in view to get params');
            console.log(ctx);
            return null;
        },
        //*/
        fields: [
            {
                name: 'ctrl003',
                position: [1,2],
                label: null
            },
            {
                name: 'ctrl001',
                position: [1,2],
                valueChangeFunc: function(s,n,o){
                    const m = s.props.parent.find('ctrl002');
                    if(n==='2') m.reset();
                    m.setEnable(n!=='2');
                    
                }
            },
            {
                name: 'ctrl002',
                position: [1,2]
            },
            {
                name: 'ctrl005',
                position: [1,2]
            }

        ]
    },
    'view2':{
        name: 'view2',
        dataApi: '/mock/data.json',
        submitApi: '/submit',
        fields: [
            {
                name: 'ctrl003',
                position: [1,2]
            },
            {
                name: 'ctrl001',
                position: [1,2],
                valueChangeFunc: function(s,n,o){
                    s.props.parent.find('ctrl002').setVisible(n!=='2');
                }
            },
            {
                name: 'ctrl002',
                position: [1,2],
                label: 'Login Name'
            },
            {
                name: 'ctrl006',
                position: [1,2],
                label: 'Extra notes'
            }
        ]
    },
    ....
});
```
index.html
```html
...
<div id="configLoader"></div>
<div role="react-loader" view="view1"></div>
...
```
index.tsx
```tsx
import * as React from 'react';

//intial setup 
DynConfig.appDOM = ReactDOM;
DynConfig.customValidationMessage = (msg: string, sender: IComponent, newVal: string, oldVal: string, context: IAppContext) => {
    return <>
        <div className="alert alert-danger">{msg}</div>
    </>;

};

ReactDOM.render(<Dyn.ConfigLoader fieldUrls={'fields.js'} viewUrls={'views.js'} />, document.getElementById('configLoader'));

```

## License

MIT © [Blue Moon](https://github.com/???)
