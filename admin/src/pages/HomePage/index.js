import './index.css';

import { join } from 'path';
import React, {memo, useState} from 'react';
import {ContentLayout, HeaderLayout} from '@strapi/design-system/Layout';
import pluginId from '../../pluginId';
import getTrad from '../../utils/getTrad';
import {request, useNotification} from '@strapi/helper-plugin';
import {Divider, Button, Box, Table, Thead, Tbody, TableLabel, Tr, Th, Td, Text} from '@strapi/design-system';

import {UnControlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
require('codemirror/mode/sql/sql');

import * as pkg from '../../../../package.json';
import _ from 'lodash'

const HomePage = () => {

  const toggleNotification = useNotification();

  const [code, setCode] = useState(
    'SELECT email FROM admin_users LIMIT 1;\n' +
    'SELECT * FROM admin_users LIMIT 1;\n' +
    'SELECT firstname, lastname FROM admin_users LIMIT 1;'
  );

  const [tableData, setTableData] = useState([]);
  const [executing, setExecuting] = useState(false);

  const editorDidMount = (editor, monaco) => {
    const code = window.localStorage.getItem(`${pluginId}_code`);
    if (code && code.length) {
      setCode(code);
      editor.setValue(code);
    }
    editor.focus();
  }

  const onChange = (editor, data, value) => {
    window.localStorage.setItem(`${pluginId}_code`, value);
    setCode(value);
  }

  const executeQuery = async () => {
    try {
      setExecuting(true);
      setTableData([]);

      const response = await request(`/${pluginId}/execute`, {
        method: 'POST',
        body: {
          code,
        },
      });

      toggleNotification({
        type: 'success',
        message: {
          id: `${getTrad('notification.info.execute.success')}`,
        },
      });

      setTableData(response.results);
    } catch (err) {
      console.error(err);
      toggleNotification({
        type: 'warning',
        message: {
          id: `${getTrad('notification.info.execute.error')}`,
        },
      });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <>
      <div className={'raw-query'}>
        <HeaderLayout
          id="title"
          title={pkg.strapi.displayName}
          subtitle={pkg.strapi.description}
        />
        <ContentLayout>
          <CodeMirror
            height="200px"
            value={code}
            options={{
              mode: 'sql',
              theme: 'dracula',
              lineNumbers: true
            }}
            editorDidMount={editorDidMount}
            onChange={onChange}
          />
          <Button
            className="raw-query_execute"
            onClick={executeQuery}
            loading={executing}
            disabled={executing}
          >
            Execute
          </Button>
          <div style={{overflow: 'auto', margin: '24px 0px'}}>
            {tableData.length ? tableData.map((data, index) => {
              if (data.result.rows.length) {
                return (
                  <div key={'table_' + index} className={'raw-query_query'}>
                    <p><b>Query:</b><small>{data.result.rows.length} Results</small></p>
                    <div className="code">
                      <pre>{data.query};</pre>
                    </div>
                    <Box>
                      <Table colCount={data.result.fields.length} rowCount={data.result.rows.length}>
                        <Thead>
                          <Tr>
                            {
                              data.result.fields.map((th, index) => {
                                return (
                                  <Th style={{padding: '16px'}} key={'th_' + index}>
                                    <TableLabel>{th.name}</TableLabel>
                                  </Th>
                                )
                              })
                            }
                          </Tr>
                        </Thead>
                        <Tbody>
                          {
                            data.result.rows.map((row, index) => {
                              return (
                                <Tr key={'row_' + index}>
                                  {
                                    data.result.fields.map((field, index_2) => {
                                      return (
                                        <Td style={{padding: '16px'}} key={'td_' + index_2}>
                                          <Text>{
                                            _.isString(row[field.name])
                                            ? row[field.name]
                                            : JSON.stringify(row[field.name])
                                          }</Text>
                                        </Td>
                                      )
                                    })
                                  }
                                </Tr>
                              )
                            })
                          }
                        </Tbody>
                      </Table>
                    </Box>
                    <Divider/>
                  </div>
                )
              } else {
                console.log('2', data.result)
                return (
                  <div className={'raw-query_query'}>
                    <p><b>Query:</b><small>{data.result.rows.length} Results</small></p>
                    <div className="code">
                      <pre>{data.query};</pre>
                    </div>
                    <p>No results to display.</p>
                    <Divider/>
                  </div>
                )
              }
            }) : ''}
          </div>
        </ContentLayout>
      </div>
    </>
  );
};

export default memo(HomePage);
