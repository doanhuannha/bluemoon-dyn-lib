import React, { ReactNode, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import {BaseComponent} from '../BaseComponent';


export default class HtmlTemplate extends BaseComponent{

    private bindData = function(s: string, data: any) {
        if(data){
            s = s.replace(/{(\w+)}/ig, (m: any, g: any)=>{
                if(g==='children') return data[g];
                else return ('' + data[g]).replace(/>/ig, '&gt;').replace(/</ig, '&lt;');
            });
        }
        
        return s;
    };
    elContainer = React.createRef<HTMLDivElement>();
    renderedEls = [] as any[];
    componentWillUnmount(){
        if(this.renderedEls && this.renderedEls.length>0){
            for(let i = 0;i<this.renderedEls.length;i++){
                const el = this.renderedEls[i];
                if(el) el.parentElement.removeChild(el);
                
            }    
            this.renderedEls = [];
        }
    }
    componentDidMount(){
        
        const divCont = this.elContainer.current;
        if(divCont){
            const data = this.state.value || this.props.value;
            
            const html = this.bindData(this.props.options.html, data);
            divCont.insertAdjacentHTML('afterbegin', html);
            
            const pp = divCont.parentElement;
            if(this.props.children) ReactDOM.render(<>{this.props.children}</>, divCont.querySelector('[role="children"]'));

            const nextSibling = divCont.nextSibling;
            if(nextSibling) while(divCont.childNodes.length>0){ 
                pp.insertBefore(divCont.childNodes[0], nextSibling);
                this.renderedEls.push(divCont.childNodes[0] as HTMLElement);
            }
            else while(divCont.childNodes.length>0) {
                pp.appendChild(divCont.childNodes[0]);
                this.renderedEls.push(divCont.childNodes[0]);
            }

            
            
        }
    }
    protected renderComponent() {

        return <div ref={this.elContainer} style={{display: 'block'}}></div>
    }
}