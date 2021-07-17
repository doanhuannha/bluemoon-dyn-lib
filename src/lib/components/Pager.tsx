import React, { ReactNode } from 'react'
import { BaseComponent } from '../BaseComponent';
import { DataPool } from '../DataPool';
export const Pager = (p: { pageIndex: number, pageSize: number, totalRow: number, parent: BaseComponent, pagingHandler: (sender: BaseComponent, pageIndex: number, pageSize: number) => void }) => {
    const pageListCount = 7;
    const currentPage = p.pageIndex;
    const centerPage = Math.floor(p.pageSize / 2);
    let lastPage = Math.floor(p.totalRow / p.pageSize);
    if (p.totalRow % p.pageSize != 0) lastPage++;

    let currentGroup = currentPage / pageListCount;
    if (currentPage % pageListCount != 0) currentGroup++;
    const items = [] as React.ReactElement[];
    const pagerClicked = (evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>, index: number) => {
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
}