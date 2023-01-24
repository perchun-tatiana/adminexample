import React, { Component } from 'react'
import './PostList.css';
import { useHistory } from 'react-router-dom';
import ReactTable from 'react-table-6'
import "react-table-6/react-table.css";
import Select from 'react-select';

var serversettings = require('../serversettings.js');


async function loginUser(status) {
    debugger
    var token = JSON.parse(localStorage.token).token
    if (status) {
        return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/postlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token, status: status })
        })
            .then(data => data.json())
    } else {
        return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/postlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        })
            .then(data => data.json())
    }

}

async function savepost(text, type, group) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/savepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text, type: type, groupid: group, token: token })
    })
        .then(data => data.json())
}

async function removeforuser(objid) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/removeforusers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objid: objid, token: token })
    })
        .then(data => data.json())
}

async function removefromdatabase(objid) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/removefromdatabase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objid: objid, token: token })
    })
        .then(data => data.json())
}


async function sendnow(objid) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/sendnow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objid: objid, token: token })
    })
        .then(data => data.json())
}


async function sendindate(objid, date) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/sendindate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objid: objid, datetosend: date, token: token })
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
        this.posttextInput = React.createRef();
        this.posttypeInput = React.createRef();
        this.groupidInput = React.createRef();
        this.dateInput = React.createRef();
        this.addHandler = this.addHandler.bind(this);
        this.addDate = this.addDate.bind(this);
    }
    async fetchUsers() {
        var data = await loginUser()
        if (data.redirect) {
            this.props.history.push(`/logout`);

        } else {
            this.setState({
                users: data.postlist,

            })
        }
    }
    async setModal(flag) {

        this.setState({
            users: this.postlist,
            modal: flag

        })

    }
    async setModal2(flag, atr) {
        debugger
        if (atr) {

            this.setState({
                users: this.postlist,
                modal2: flag,
                objid: atr.target.id.replace('sendindate', '')
            })
        } else {

            this.setState({
                users: this.postlist,
                modal2: flag

            })
        }

    }
    async isModal() {
        return this.state.modal

    }
    componentDidMount() {
        this.fetchUsers();
        // this.timer = setInterval(() => this.fetchUsers(), 5000);
    };

    async handleOnRemovefromDatabase(atr) {
        var objid = atr.target.id.replace('removefromdatabase', '')

        var data = await removefromdatabase(objid)
        if (data && data.result == 'success') {
            alert('Пост успешно удален из базы')
        } else {
            alert('Ошибка удаления')

        }
        this.fetchUsers();


    };

    async handleOnRemoveforUser(atr) {
        var objid = atr.target.id.replace('removeforusers', '')
        var data = await removeforuser(objid)
        if (data && data.result == 'success') {
            alert('Пост поставлен в очередь удаления у пользователей')
        } else {
            alert('Ошибка удаления')

        }
        this.fetchUsers();
    };

    async handleOnSendNow(atr) {
        var objid = atr.target.id.replace('sendnow', '')
        var data = await sendnow(objid)
        if (data && data.result == 'success') {
            alert('Пост рассылается')
        } else {
            alert('Ошибка удаления')

        }
        this.fetchUsers();
    };

    async addHandler() {
        const text = this.posttextInput.current.value;
        const type = this.posttypeInput.current.value;
        const groupid = this.groupidInput.current.value;
        var data = await savepost(text, type, groupid)
        if (data && data.result == 'success') {
            alert('Пост успешно сохранен')
        } else {
            alert('Ошибка сохранения')

        }
        this.setState({
            users: this.postlist,
            modal: false

        })
        this.fetchUsers();

    }
    async addDate() {
        const date = this.dateInput.current.value;
        var objid = this.state.objid//atr.target.id.replace('sendindate', '')
        var data = await sendindate(objid, date)

        if (data && data.result == 'success') {
            alert('Пост поставлен в очередь рассылки в указанную дату')
        } else {
            alert('Ошибка сохранения')
        }
        this.setState({
            users: this.postlist,
            modal2: false

        })
        this.fetchUsers();

    }
    render() {

        const columns = [{
            Header: 'Дата создания',
            accessor: 'date', // String-based value accessors!
            Cell: row => <div><span title={row.value}>{row.value}</span></div>,
            maxWidth: 150,
        }, {
            Header: 'Текст',
            accessor: 'text', // String-based value accessors!
            maxWidth: 200,
            Cell: row => <div><span title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Статус',
            accessor: 'state', // String-based value accessors!
            maxWidth: 200,
            Cell: row => <div ><span title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Тип',
            accessor: 'type', // String-based value accessors!
            Cell: row => <div><span class='breakspaces' title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Дата рассылки',
            accessor: 'datetosend', // String-based value accessors!
            Cell: row => <div><span class='breakspaces' title={row.value}>{row.value}</span></div>
        }, {
            Header: 'groupid',
            accessor: 'groupid', // String-based value accessors!
            Cell: row => <div><span class='breakspaces' title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Количество пользователей',
            accessor: 'usercount', // String-based value accessors!
            Cell: row => <div><span class='breakspaces' title={row.value}>{row.value}</span></div>
        }, {
            Header: 'Действия',
            maxWidth: 100,
            accessor: 'removeforusers', // String-based value accessors!
            Cell: row => <div >
                <button style={{ 'background': '#ff6e92', 'float': 'left', 'width': '100%', 'height': '30px', 'margin-bottom': '10px' }} onClick={(atr) => this.handleOnRemovefromDatabase(atr)} name="removefromdatabase" id={'removefromdatabase' + row.value} name="removefromdatabase" >❌ из базы</button>
                <button style={{ 'background': '#ff6e92', 'float': 'left', 'width': '100%', 'height': '30px', 'margin-bottom': '10px' }} onClick={(atr) => this.handleOnRemoveforUser(atr)} name="removeforusers" id={'removeforusers' + row.value} >❌ у пользователей</button>
                <button style={{ 'background': '#6fed68', 'float': 'left', 'width': '100%', 'height': '30px', 'margin-bottom': '10px' }} onClick={(atr) => this.handleOnSendNow(atr)} name="sendnow" id={'sendnow' + row.value} >📨 сейчас</button>
                <button style={{ 'background': '#6fed68', 'float': 'left', 'width': '100%', 'height': '30px', 'margin-bottom': '10px' }} onClick={(atr) => this.setModal2(true, atr)} name="sendindate" id={'sendindate' + row.value} >📨 в дату</button>
            </div>
        }]



        const handleClickAll = () => {

            this.props.history.push(`/dashboard`);
        }

        const handleClickAll2 = () => {

            this.props.history.push(`/messlist`);
        }

        const Modal = ({ isVisible = false, title, content, footer, onClose }) => {
            const keydownHandler = ({ key }) => {
                switch (key) {
                    case 'Escape':
                        onClose();
                        break;
                    default:
                }
            };

            React.useEffect(() => {
                document.addEventListener('keydown', keydownHandler);
                return () => document.removeEventListener('keydown', keydownHandler);
            });

            return !isVisible ? null : (
                <div className="modal" onClick={onClose}>
                    <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{title}</h3>
                            <span className="modal-close" onClick={onClose}>
                                &times;
                    </span>
                        </div>
                        <div className="modal-body">
                            <div className="modal-content">{content}</div>
                        </div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            );
        };

        return (
            <div>
                <h1 id='title'>{serversettings.botname}</h1>
                <h3 style={{ 'margin-left': '30px' }} onClick={() => handleClickAll()}>Перейти к списку пользователей</h3>
                <h3 style={{ 'margin-left': '30px' }} onClick={() => handleClickAll2()}>Перейти к списку не прочитанных сообщений</h3>
                <button style={{ 'margin-left': '30px', 'margin-bottom': '20px', 'height': '30px' }} onClick={() => this.setModal(true)}>Добавить рассылку</button>
                <Modal

                    isVisible={this.state.modal}
                    title="Новая рассылка"
                    content={<div>
                        <p style={{ 'margin-top': '0px' }}><b>Введите текст рассылки:</b></p>
                        <textarea ref={this.posttextInput} style={{ 'width': '100%', 'min-height': '100px' }} type="text" name="textarea" />
                        <p><b>Выберите тип рассылки:</b></p>
                        <select ref={this.posttypeInput} style={{ 'width': '100%' }}>
                            <option>Прошедшие регистрацию</option>
                            <option>С активной подпиской</option>
                            <option>С закончившейся подпиской</option>
                            <option>Пользователи в группе</option>

                        </select>
                        <p><b>Напишите id группы:</b></p>
                        <input ref={this.groupidInput} type="text" name="input" style={{ 'width': '100%' }} />
                    </div>}
                    footer={<button onClick={(atr) => this.addHandler(atr)}>Сохранить в базе</button>}
                    onClose={() => this.setModal(false)}
                />

                <Modal

                    isVisible={this.state.modal2}
                    title="Выберите дату рассылки"
                    content={<div>
                        <p><b>Напишите дату в формате dd-mm-yyyy hh:mm</b></p>
                        <input ref={this.dateInput} type="text" name="input" style={{ 'width': '100%' }} />
                    </div>}
                    footer={<button id={this.state.objid} onClick={(atr) => this.addDate(atr)}>Разослать в дату</button>}
                    onClose={() => this.setModal2(false)}
                />
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
                                    if (rowInfo) {

                                        // if (column.id == 'removeforusers') {
                                        //     this.handleOnRemoveforUser(rowInfo.original.objid)

                                        // }
                                        // if (column.id == 'removefromdatabase') {
                                        //     this.handleOnRemovefromDatabase(rowInfo.original.objid)

                                        // }
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