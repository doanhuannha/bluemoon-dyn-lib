import React from 'react';
import { BaseComponent } from '../BaseComponent';

export default class Hidden extends BaseComponent {

    protected renderComponent(): React.ReactNode {
        return <>
            <input id={this.props.id} type="hidden" value={window.utilities.getDefault(this.getValue(), '')} />
        </>;
    }

}