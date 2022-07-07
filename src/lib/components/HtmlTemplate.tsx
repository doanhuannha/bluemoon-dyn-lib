import React, { ReactNode, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import {BaseComponent} from '../BaseComponent';


export default class HtmlTemplate extends BaseComponent{

    public static bindData(s: string, data: any): string {
        if(data){
            s = s.replace(/{(\w+)}/ig, (m: any, g: any)=>{
                if(g==='children') return data[g];
                else return ('' + data[g]).replace(/>/ig, '&gt;').replace(/</ig, '&lt;');
            });
        }
        
        return s;
    };
    _elContainer = React.createRef<HTMLDivElement>();
    _renderedEls = [] as HTMLElement[];
    componentWillUnmount(){
        if(this._renderedEls && this._renderedEls.length>0){
            for(let i = 0;i<this._renderedEls.length;i++){
                const el = this._renderedEls[i];
                if(el) el.remove();
            }    
            this._renderedEls = [];
        }
    }
    componentDidMount(){
        
        const divCont = this._elContainer.current;
        if(divCont){
            const data = this.state.value || this.props.value;
            
            const html = HtmlTemplate.bindData(this.props.options.html, data);
            divCont.insertAdjacentHTML('afterbegin', html);
            
            const pp = divCont.parentElement;
            if(this.props.children) ReactDOM.render(<>{this.props.children}</>, divCont.querySelector('[role="children"]'));

            const nextSibling = divCont.nextSibling;
            if(nextSibling) while(divCont.childNodes.length>0){ 
                pp.insertBefore(divCont.childNodes[0], nextSibling);
                this._renderedEls.push(divCont.childNodes[0] as HTMLElement);
            }
            else while(divCont.childNodes.length>0) {
                pp.appendChild(divCont.childNodes[0]);
                this._renderedEls.push(divCont.childNodes[0] as HTMLElement);
            }
            divCont.remove();
            
            
        }
    }
    protected renderComponent() {
        return <div ref={this._elContainer} className="tpl-renderer" style={{display: 'none'}}></div>
    }
}