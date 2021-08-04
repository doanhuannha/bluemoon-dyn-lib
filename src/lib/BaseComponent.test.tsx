import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import { BaseComponent } from './BaseComponent';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';



describe('test BaseComponent', () => {
    window.alert = jest.fn();
    class MyTestComp extends BaseComponent {
        protected renderComponent(): React.ReactNode {
            const items = [];
            const data = this.state.dataSource;

            if (data != null) {
                for (let i = 0; i < data.length; i++) {
                    items.push(<li key={this.props.id + i}>{data[i]}</li>);
                }
            }
            return <ul id={this.props.id} data-value={this.getValue()} data-default={this.defaultValue} data-readonly={this.state.readonly} data-enable={this.state.enable ? null : false}> {items}</ul>;
        }

    }
    test('test BaseComponent', () => {
        let objRef = null as BaseComponent;
        const onDidMount = jest.fn(function (s: any) {
            objRef = s;
        });
        const ds = [
            'Item 1',
            'Item 2',
            'Item 3',
        ];
        DynConfig.customValidationMessage = function (msg) {
            return <span className="message">{msg}</span>
        };
        const onValChanged = jest.fn();

        const onValidateFunc = jest.fn(function (s: any, n: string, o: string) {
            if (n == 'Item 2') return 'Invalid';
            return null;
        });
        let r = null;

        expect(new MyTestComp(null)).toBeInstanceOf(BaseComponent);

        //test no mount event
        render(<MyTestComp id="cidBaseComponent" />);
        expect(objRef).toEqual(null);
        cleanup();
        r = render(<MyTestComp id="cidBaseComponent" didMountFunction={onDidMount} dataSource={ds} valueChangedFunc={onValChanged} validationFunc={onValidateFunc} />);
        expect(onDidMount).toHaveBeenCalled();
        expect(objRef).toBeInstanceOf(MyTestComp);

        expect(objRef.isValid()).toEqual(true);

        let el = document.getElementById('cidBaseComponent');
        expect(el.tagName).toEqual('UL');

        objRef.setVisible(false);
        el = document.getElementById('cidBaseComponent');
        expect(el).toEqual(null);

        objRef.setVisible(true);
        el = document.getElementById('cidBaseComponent');
        expect(el.tagName).toEqual('UL');

        expect(el.firstElementChild.tagName).toEqual('LI');
        ds[ds.length] = 'Item 4';
        objRef.setDataSource(ds);
        expect(el.getElementsByTagName('li').length).toEqual(4);

        objRef.setValue('Item 2', false);
        //objRef.isValid();
        expect(onValChanged).toHaveBeenCalled();
        expect(el.getAttribute('data-value')).toEqual('Item 2');
        expect(el.getAttribute('data-default')).toEqual(null);
        expect(onValidateFunc).toHaveBeenCalledTimes(2);
        expect(r.container.getElementsByTagName('span')[0].innerHTML).toEqual('Invalid');


        objRef.setValue('Item 3', true);
        expect(el.getAttribute('data-value')).toEqual('Item 3');
        expect(el.getAttribute('data-default')).toEqual('Item 3');
        expect(onValidateFunc).toHaveBeenCalledTimes(3);
        expect(r.container.getElementsByTagName('span').length).toEqual(0);

        objRef.setValue('Item 1');
        expect(el.getAttribute('data-value')).toEqual('Item 1');
        expect(el.getAttribute('data-default')).toEqual('Item 3');
        expect(objRef.isValid()).toEqual(true);

        objRef.reset();
        expect(el.getAttribute('data-value')).toEqual('Item 3');

        objRef.setValue(null);
        expect(objRef.state.value).toEqual(null);

        objRef.setEnable(false);
        expect(el.getAttribute('data-enable')).toEqual('false');
        objRef.setEnable(true);
        expect(el.getAttribute('data-enable')).toEqual(null);

        objRef.setReadonly(true);
        expect(el.getAttribute('data-readonly')).toEqual('true');
        objRef.setEnable(false);
        expect(el.getAttribute('data-enable')).toEqual('false');

        cleanup();
        DynConfig.customValidationMessage = null;
        //test validation with rules
        r = render(<MyTestComp id="cidBaseComponent" didMountFunction={onDidMount} dataSource={ds} valueChangedFunc={onValChanged} validationRules={[{ rule: 'required', msg: 'This field is required' }]} />);
        expect(objRef.isValid()).toEqual(false);
        objRef.setValue('Item 1');
        expect(objRef.isValid()).toEqual(true);
        objRef.setValue(null);
        expect(objRef.isValid()).toEqual(false);

        //test invisible
        cleanup();
        r = render(<MyTestComp id="cidBaseComponent" didMountFunction={onDidMount} dataSource={ds} valueChangedFunc={onValChanged} validationRules={[{ rule: 'required', msg: 'This field is required' }]} visible={false} enable={false} readonly={true} />);
        expect(r.container.innerHTML).toEqual('');


        //test init value
        cleanup();
        r = render(<MyTestComp id="cidBaseComponent" value="Item 001" didMountFunction={onDidMount} dataSource={ds} valueChangedFunc={onValChanged} validationRules={[{ rule: 'required', msg: 'This field is required' }]} />);
        el = document.getElementById('cidBaseComponent');
        expect(objRef.getValue()).toEqual('Item 001');
        expect(el.getAttribute('data-value')).toEqual('Item 001');
        expect(objRef.getDataSource()).toEqual(ds);
        expect(objRef.getView()).toEqual(undefined);

    });

});

