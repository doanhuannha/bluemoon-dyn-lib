import './Utilities';

describe('test window.validator', () => {
    test('test registerRule', () => {
        window.validator.registerRule('test-rule', (n, o, opt) => {
            if (n == 'ok') return null;
            return opt.msg;
        });
        expect(window.validator.registeredRules['test-rule']('ok', '', { msg: 'error' })).toEqual(null);

    });
    describe('test validate', () => {
        test('test valid value', () => {
            let r = window.validator.validate('newVal', 'oldValue', [{ rule: 'required', msg: 'This field is required' }], null);
            expect(r == null).toEqual(true);
        });
        test('test invalid value', () => {
            let r = window.validator.validate('', null, [{ rule: 'required', msg: 'This field is required' }], null);
            expect(r).toEqual('This field is required');
        });
        test('test null value', () => {
            let r = window.validator.validate(null, null, [{ rule: 'required', msg: 'This field is required' }], null);
            expect(r).toEqual('This field is required');
        });
    });
    describe('test rules', () => {
        test('test minLength', () => {
            let msg = 'Min length is 5';
            let rule = 'minLength';
            let r = window.validator.registeredRules[rule]('a1234', null, { msg, minLength: 5 });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('a123', null, { msg, minLength: 5 });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg, minLength: 5 });
            expect(r).toEqual(null);
        });
        test('test maxLength', () => {
            let msg = 'Max length is 5';
            let rule = 'maxLength';
            let r = window.validator.registeredRules[rule]('a1234', null, { msg, maxLength: 5 });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('a12345', null, { msg, maxLength: 5 });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg, maxLength: 5 });
            expect(r).toEqual(null);
        });
        test('test min val', () => {
            let msg = 'Min value is 5';
            let rule = 'min';
            let r = window.validator.registeredRules[rule]('5', null, { msg, minValue: 5 });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('4', null, { msg, minValue: 5 });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg, minValue: 5 });
            expect(r).toEqual(null);
        });
        test('test max val', () => {
            let msg = 'Max value is 5';
            let rule = 'max';
            let r = window.validator.registeredRules[rule]('5', null, { msg, maxValue: 5 });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('6', null, { msg, maxValue: 5 });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg, maxValue: 5 });
            expect(r).toEqual(null);
        });

        test('test email', () => {
            let msg = 'Must be an email address';
            let rule = 'email';
            let r = window.validator.registeredRules[rule]('mail@mail.com', null, { msg });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('mail', null, { msg });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg });
            expect(r).toEqual(null);


        });
        test('test url', () => {
            let msg = 'Must be an url address';
            let rule = 'url';
            let r = window.validator.registeredRules[rule]('http://mail.com', null, { msg });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('http://mail', null, { msg });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg });
            expect(r).toEqual(null);
        });

        test('test digits', () => {
            let msg = 'Must be all digits';
            let rule = 'digits';
            let r = window.validator.registeredRules[rule]('65465475', null, { msg });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('43d454f', null, { msg });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg });
            expect(r).toEqual(null);
        });

        test('test number', () => {
            let msg = 'Must be a number';
            let rule = 'number';
            let r = window.validator.registeredRules[rule]('-65,465,475.78', null, { msg });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('43d45.4f', null, { msg });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg });
            expect(r).toEqual(null);
        });

        test('test date', () => {
            let msg = 'Must be a date';
            let rule = 'date';
            let r = window.validator.registeredRules[rule]('01/21/2001', null, { msg });
            expect(r).toEqual(null);
            r = window.validator.registeredRules[rule]('2053/56/4', null, { msg });
            expect(r).toEqual(msg);
            r = window.validator.registeredRules[rule]('', null, { msg });
            expect(r).toEqual(null);
        });
        describe('test remote', () => {

            XMLHttpRequest.prototype.open = jest.fn();
            XMLHttpRequest.prototype.send = function (data: string) {
                let json = JSON.parse(data);
                
                Object.defineProperty(this, 'readyState', {
                    writable: true,
                    value: XMLHttpRequest.DONE,
                });
                Object.defineProperty(this, 'status', {
                    writable: true,
                    value: 200,
                });

                const d = new Document();
                d.textContent = '{}';
                Object.defineProperty(d, 'textContent', {
                    writable: true,
                    value: json.value == 'value001'? 'true': 'false',
                });

                Object.defineProperty(this, 'responseXML', {
                    writable: true,
                    value: d,
                });
                
                if (json.value == 'value003')  Object.defineProperty(this, 'status', {
                    writable: true,
                    value: 500,
                });
                this.onreadystatechange(null);
            };
            XMLHttpRequest.prototype.setRequestHeader = jest.fn();
            //*/
            const rule = 'remote';
            const opt = {
                msg: 'Error msg',
                url: 'fakeUrl',
                method: 'GET',
                headers: [
                    {
                        name: 'H1',
                        value: 'HV1'
                    },
                    {
                        name: 'H2',
                        value: 'HV2'
                    }
                ]
            };
            let r = window.validator.registeredRules[rule]('value001', null, opt);
            expect(r).toEqual(null);

            opt.method = null;
            opt.headers = null;
            r = window.validator.registeredRules[rule]('value002', null, opt);
            expect(r).toEqual(opt.msg);

            r = window.validator.registeredRules[rule]('value003', null, opt);
            expect(r).toEqual(opt.msg);

            r = window.validator.registeredRules[rule]('', null, opt);
            expect(r).toEqual(null);
        });
    });
});