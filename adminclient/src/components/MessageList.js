import React, { Component } from 'react'
import './MessageList.css';
import { useHistory } from 'react-router-dom';
import ReactTable from 'react-table-6'
import "react-table-6/react-table.css";
import Select from 'react-select';

var serversettings = require('../serversettings.js');


async function loginUser(status) {
    debugger
    var token = JSON.parse(localStorage.token).token
    if (status) {
        return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/messagelist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token, status: status })
        })
            .then(data => data.json())
    } else {
        return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/messagelist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        })
            .then(data => data.json())
    }

}

async function markasread(chatid) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/markasread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatid: chatid, token: token })
    })
        .then(data => data.json())
}

function withMyHook(Component) {
    return function WrappedComponent(props) {
        const history = useHistory();
        return <Component {...props} history={history} />;
    }
}

class Table extends Component {

    constructor(props) {

        super(props);

        this.state = {
            isFetching: false,
            users: [],

        };
    }
    async fetchUsers() {
        var data = await loginUser()
        if (data.redirect) {
            this.props.history.push(`/logout`);

        } else {
            this.setState({
                users: data.messagelist,

            })
        }
    }

    componentDidMount() {
        this.fetchUsers();
        // this.timer = setInterval(() => this.fetchUsers(), 5000);
    }


    render() {
        const columns = [{
            Header: 'chatid',
            accessor: 'chatid', // String-based value accessors!
            Cell: row => <div><span title={row.value}>{row.value}</span></div>,
            maxWidth: 150,
        }, {
            Header: 'email',
            accessor: 'email', // String-based value accessors!
            maxWidth: 200,
            Cell: row => <div><span title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Статус',
            accessor: 'subscr', // String-based value accessors!
            maxWidth: 200,
            Cell: row => <div ><span title={row.value}>{row.value}</span></div>

            // }, {
            //     Header: 'Дата последнего сообщения',
            //     accessor: 'date', // String-based value accessors!
            //     Cell: row => <div><span title={row.value}>{row.value}</span></div>

        }, {
            Header: 'Текст',
            accessor: 'text', // String-based value accessors!
            Cell: row => <div><span class='breakspaces' title={row.value}>{row.value}</span></div>

            // }, {
            //     Header: 'Количество непрочитанных сообщений',
            //     accessor: 'number', // String-based value accessors!
            //     Cell: row => <div><span title={row.value}>{row.value}</span></div>

        }, {
            Header: 'Пометить как прочитанное',
            maxWidth: 100,
            accessor: 'markasread', // String-based value accessors!
            Cell: row => <div ><button name="markasread" >Прочитано</button></div>

        }]

        const handleRowClick2 = (chatid) => {

            this.props.history.push(`/messages?${chatid}`);
        }

        const handleOnMarkAsRead = (chatid) => {
            markasread(chatid)

            setTimeout(() => {
                this.fetchUsers();

            }, 1000 * 80);

        };
        const handleClickAll = () => {

            this.props.history.push(`/dashboard`);
        }
        const handleClickAll2 = () => {

            this.props.history.push(`/postlist`);
        }
        return (
            <div>
                <h1 id='title'>{serversettings.botname}</h1>
                <h3 style={{ 'margin-left': '30px' }} onClick={() => handleClickAll()}>Перейти к списку пользователей</h3>
                <h3 style={{ 'margin-left': '30px' }} onClick={() => handleClickAll2()}>Перейти к списку постов</h3>

                <ReactTable
                    style={{ clear: 'left' }}
                    className='-striped'
                    data={this.state.users}
                    columns={columns}
                    showPagination={true}
                    defaultFilterMethod={function (filter, row, column) {
                        const id = filter.pivotId || filter.id
                        return row[id] !== undefined ? String(row[id]).startsWith(filter.value.toLowerCase()) : true
                    }}
                    showPaginationBottom={true}
                    showPageSizeOptions={true}
                    pageSizeOptions={[5, 10, 20, 25, 50, 100]}
                    defaultPageSize={10}
                    filterable={true}
                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                            onClick: (e, handleOriginal) => {
                                if (rowInfo) {

                                    if (column.id == 'text') {
                                        handleRowClick2(rowInfo.original.chatid)

                                    }
                                    if (column.id == 'markasread') {
                                        handleOnMarkAsRead(rowInfo.original.chatid)

                                    }
                                }

                            }
                        };
                    }}
                />
            </div>
        )
    }
}


export default withMyHook(Table);