import React from 'react'
import { BaseComponent } from '../BaseComponent';
import { View } from '../View';
export default class ViewLoader extends BaseComponent {
    protected renderComponent(): React.ReactNode {
        let v = this.getValue();
        if (v != null) {
            let id = this.props.id + '_' +  new Date().getTime();
            if (typeof (v) == 'string') return <View id={id} key={id} name={v as string} />;
            else if(v.name!=null) return <View id={id} key={id} {...v} />;
        }
        return null;

    }
}