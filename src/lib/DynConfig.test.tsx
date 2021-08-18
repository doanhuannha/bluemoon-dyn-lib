import React from 'react';
import { DynConfig } from './DynConfig';
import './Utilities.tsx';
import { DataPool } from './DataPool';

describe('test DynConfig',()=>{
    test('test exportLayouts', () => {
        DataPool.allLayouts = null;
        function MyLayoutTestExport() {
            return <div></div>;
        }
        DynConfig.exportLayouts({
            'testExportLayout1': MyLayoutTestExport
        });
        DynConfig.exportLayouts({
            'testExportLayout2': MyLayoutTestExport
        });
        expect(DataPool.allLayouts['testExportLayout1']).toEqual(MyLayoutTestExport);
        expect(DataPool.allLayouts['testExportLayout2']).toEqual(MyLayoutTestExport);
    
    });
    test('test exportControls', () => {
        DataPool.allControls = null;
        function MyControlTestExport() {
            return <div></div>;
        }
        DynConfig.exportControls({
            'testExportControl1': MyControlTestExport
        });
        DynConfig.exportControls({
            'testExportControl2': MyControlTestExport
        });
        expect(DataPool.allControls['testExportControl1']).toEqual(MyControlTestExport);
        expect(DataPool.allControls['testExportControl2']).toEqual(MyControlTestExport);
    
    });
    
    test('test exportPages', () => {
        DataPool.allPages = null;
        function MyPageTestExport() {
            return <div></div>;
        }
        DynConfig.exportPages({
            'testExportPage1': MyPageTestExport
        });
    
        expect(DataPool.allPages['testExportPage1']).toEqual(MyPageTestExport);
    
        DynConfig.exportPages({
            'testExportPage2': MyPageTestExport
        });
    
        expect(DataPool.allPages['testExportPage2']).toEqual(MyPageTestExport);
    
    });
    
    
});

