import React from 'react'
import { BaseComponent } from '../BaseComponent';
export const Pager = (p: { pageIndex: number, pageSize: number, totalRow: number, parent: BaseComponent, pageListCount?: number, pagingHandler: (sender: BaseComponent, pageIndex: number, pageSize: number) => void }) => {
    const pageListCount = p.pageListCount || 7;
    const currentPage = p.pageIndex;
    const centerPage = Math.floor(pageListCount / 2);
    let lastPage = Math.floor(p.totalRow / p.pageSize);
    if (p.totalRow % p.pageSize != 0) lastPage++;

    const items = [] as React.ReactElement[];
    const pagerClicked = (evt: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
        if (index != currentPage && p.pagingHandler) p.pagingHandler(p.parent, index, p.pageSize);
        evt.preventDefault();
    };
    if (currentPage <= centerPage + 1 || lastPage <= pageListCount) {
        for (let i = 1; i <= pageListCount && i <= lastPage; i++) {
            items.push(<a key={'li_' + i} className={i == currentPage ? 'current' : null} href={'#gotoPage:' + i} onClick={(evt) => { pagerClicked(evt, i); }}>{i}</a>);
        }
        if (lastPage > pageListCount) {
            
            items.push(<a key={'li_' + 0} href="#" onClick={() => { return false; }}>...</a>);
            items.push(<a key={'li_' + lastPage} href={'#gotoPage:' + lastPage} onClick={(evt) => { pagerClicked(evt, lastPage); }}>{lastPage}</a>);
        }
    }
    else if (currentPage > lastPage - centerPage - 1) {
        if (lastPage > pageListCount) {
            items.push(<a key={'li_' + 1} href="#gotoPage:1" onClick={(evt) => { pagerClicked(evt, 1); }}>1</a>);
            items.push(<a key={'li_' + 0} href="#" onClick={() => { return false; }}>...</a>);
        }
        for (let i = lastPage - pageListCount + 1; i <= lastPage; i++) {

            items.push(<a key={'li_' + i} className={i == currentPage ? 'current' : null} href={'#gotoPage:' + i} onClick={(evt) => { pagerClicked(evt, i); }}>{i}</a>);
        }
    }
    else {
        items.push(<a key={'li_' + 1} href="#gotoPage:1" onClick={(evt) => { pagerClicked(evt, 1); }}>1</a>);
        items.push(<a key={'li_S'} href="#" onClick={() => { return false; }}>...</a>);
        for (let i = currentPage - centerPage; i <= currentPage + centerPage && i <= lastPage; i++) {

            items.push(<a key={'li_' + i} className={i == currentPage ? 'current' : null} href={'#gotoPage:' + i} onClick={(evt) => { pagerClicked(evt, i); }}>{i}</a>);
        }
        items.push(<a key={'li_E'} href="#" onClick={() => { return false; }}>...</a>);
        items.push(<a key={'li_' + lastPage} href={'#gotoPage:' + lastPage} onClick={(evt) => { pagerClicked(evt, lastPage); }}>{lastPage}</a>);
    }
    return (items.length <= 1 ? null : <div className="pager">
        {items}
    </div>
    );
};
export const SimplePager = (p: { pageIndex: number, pageSize: number, hasMoreRow: boolean, parent: BaseComponent, pagingHandler: (sender: BaseComponent, pageIndex: number, pageSize: number) => void }) => {
    
    const pagerClicked = (evt: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
        if (p.pagingHandler) p.pagingHandler(p.parent, index, p.pageSize);
        evt.preventDefault();

    };
    let  items = [] as React.ReactElement[];
    if(p.pageIndex>1) items.push(<button key={'pager_prev'} onClick={(evt) => { pagerClicked(evt, p.pageIndex - 1); }}>&lt;&lt;</button>);
    if(p.hasMoreRow) items.push(<button key={'pager_next'} onClick={(evt) => { pagerClicked(evt, p.pageIndex + 1); }}>&gt;&gt;</button>);
    return (items.length == 0 ? null : <div className="pager">
        {items}
    </div>);

};