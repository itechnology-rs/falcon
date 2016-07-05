import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import * as styles from './ConnectButton.css';
import Select from 'react-select';
import {APP_STATUS, BUTTON_MESSAGE} from '../../../constants/constants';

/*
	Displays a connect button and a disconnect button.
	Asks sequelize to create a new connection using credentials.
	Fires preset queries to show available databases/schemes
	inside the users' account using `ipcActions`.
	Displays errors and log messages using `ipc`.
*/

export default class ConnectButton extends Component {
    constructor(props) {
        super(props);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.testClass = this.testClass.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.state = {
            hover: false
        };
    }

    testClass() {
        /*
            Return the connection state as class-status.
            Knowing this status and getting the errorMessage and buttonMessage
            from their respective className tags will suffice to test this
            comoponent.
        */
        return `test-${this.props.connection.get('status')}`;
    }

    connect() {
        this.updateStatus(APP_STATUS.CONNECTING);
        this.props.ipcActions.connect(this.props.configuration);
    }

    disconnect() {
        this.props.ipcActions.disconnect();
    }

    onMouseOver() {
        this.setState({hover: true});
    }

    onMouseOut() {
        this.setState({hover: false});
    }

    updateStatus(status) {
        if (status !== this.props.connection.get('status')) {
            this.props.connectionActions.update({status});
            this.setState({
                buttonMessage: BUTTON_MESSAGE[status]
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.ipc.hasIn(['error', 'message'])) {
            this.updateStatus(APP_STATUS.ERROR);
        } else if (nextProps.ipc.get('databases')) {
            this.updateStatus(APP_STATUS.CONNECTED);
        } else if (!nextProps.ipc.get('databases')) {
            this.updateStatus(APP_STATUS.DISCONNECTED);
        }
    }

	render() {
		const {connection, configuration, ipc, ipcActions} = this.props;
        const status = connection.get('status');

        let errorMessage;
        let onButtonClick;

        let buttonMessage = BUTTON_MESSAGE[status];
        if (this.state.hover && status === APP_STATUS.CONNECTED) {
            buttonMessage = 'disconnect';
        }

        // what should the button do depending on the app status?
        switch (status) {

            case APP_STATUS.INITIALIZED:
                onButtonClick = this.connect;
                break;

            case APP_STATUS.ERROR:
                errorMessage = (
                    <pre className={styles.errorMessage}>
                        {
                            'Hm... there was an error connecting: ' +
                            ipc.getIn(['error', 'message'])
                        }
                    </pre>
                );

                onButtonClick = this.connect;
                break;

            case APP_STATUS.CONNECTED:
                onButtonClick = this.disconnect;
                break;

            case APP_STATUS.LOADING:
                onButtonClick = () => {};
                break;

            case APP_STATUS.DISCONNECTED:
                onButtonClick = this.connect;
                break;

            default:
                onButtonClick = this.connect;

        }


		return (
			<div className={styles.footer}>
				<a className={classnames(
                        styles.buttonPrimary,
                        [this.testClass()]
                    )}
					onClick={onButtonClick}
                    onMouseOut={() => {this.setState({hover: false});}}
                    onMouseOver={() => {this.setState({hover: true});}}
                    id={'test-connect-button'}
				>
					{buttonMessage}
				</a>
                <pre id={'test-error-message'}>
                    {errorMessage}
                </pre>
			</div>
		);
	}
}
