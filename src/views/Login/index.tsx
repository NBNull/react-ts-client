import React, { Component } from 'react';
import './index.scss';
import Logo from '@img/logo.svg';
import { Button, Toast } from 'antd-mobile'; 
import { TestPhone } from '../../utils/validator';
import { ApiGetVerifyCode, ApiMemberLogin } from '../../api';
import { local } from '../../utils/storage';

export interface ICheckState {
    focusName: string;
    phone: string;
    code: string;
    sendingCodeStatus: boolean;
    sendingCodeText: string;
    leftTime: number;
    handleTimer: any;
    submitStatus: boolean;
}

class Login extends Component<any, ICheckState> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            focusName: '',
            phone: '',
            code: '',
            sendingCodeStatus: false,
            sendingCodeText: '',
            leftTime: 120,
            handleTimer: null,
            submitStatus: false,
        }
    }

    // 手机号码输入操作
    handlePhoneChange(event: any) {
        this.setState({ 
            phone: event.target.value 
        });
    }

    // 验证码输入操作
    handleCodeChange(event: any) {
        this.setState({
            code: event.target.value
        });
    }

    // 输入框获取焦点
    handleInputFocus(key: any) {
        this.setState({
            focusName: key
        })
    }

    // 输入框失去焦点
    handleInputBlur() {
        this.setState({
            focusName: ''
        })
    }

    validatePhone(phone: string) {
        if (!phone) {
            Toast.info('请输入您的手机号码', 2, () => { }, false);
            return false;
        }
        if (!TestPhone(phone)) {
            return Toast.info('您的号码输入错误', 2, () => { }, false);
            return false;
        }
        return true;
    }

    // 发送验证码
    handleSendCode() {
        let { phone } = this.state;
        if(!this.validatePhone(phone)) {
            return;
        }
        ApiGetVerifyCode(phone).then((result: any) => {
            if (result.status) {
                Toast.info('验证码为:' + result.data, 2, () => { }, false);
                this.getLeftTime();
            }else {
                Toast.info(result.message, 2, () => { }, false);
            }
        }).catch((err: any) => {
            console.log(err);
        });
    }

    // 倒计时获取剩余时间
    getLeftTime() {
        let leftTime = this.state.leftTime;
        this.setState({
            sendingCodeStatus: true,
            sendingCodeText: leftTime + "s"
        })
        if (this.state.handleTimer !== undefined) {
            clearInterval(this.state.handleTimer)
            this.setState({
                handleTimer: null
            })
        };
        let handleTimer = setInterval(() => {
            leftTime--;
            if (leftTime < 0) {
                this.setState({
                    sendingCodeStatus: false,
                    sendingCodeText: "获取验证码"
                })
                leftTime = this.state.leftTime;
                clearInterval(handleTimer);
            } else {
                this.setState({
                    sendingCodeText: leftTime + "s"
                })
            }
        }, 1000);
        this.setState({
            handleTimer: handleTimer
        });
    }

    handleSubmit() {
        let { phone, code } = this.state;
        if (!this.validatePhone(phone)) {
            return;
        }
        if(code.length === 0) {
            return Toast.info('请输入验证码', 2, () => {}, false);
        }
        ApiMemberLogin(phone, code).then((result: any) => {
            if (result.status) {
                if (result.data.created) {
                    Toast.info('已为您自动创建帐号,正在登录...', 2);
                } else {
                    Toast.info('欢迎回来!!!', 2);
                }
                local.set('echi_user_id', result.data.id);
                setTimeout(() => {
                    this.props.history.replace({ pathname: '/member' });
                }, 1500);
            }else {
                Toast.info(result.message, 2);
            }
        }).catch((err: any) => {
            console.log(err);
        });
    }

    componentWillMount() {
        local.remove('echi_user_id');
    }

    render() {
        return (
            <div className="login-wrapper">
                <div className="login-verify-content">
                    <div className="login-verify-logo">
                        <img className="autoImg app-logo" src={Logo} alt="logo" title="logo" />
                    </div>
                </div>
                <form className="login-verify-check">
                    <div className="login-verify-item">
                        <label>手机号码</label>
                        <div className={`login-verify-input ${'phone' === this.state.focusName ? "focus" : null}`}>
                            <input type="number" ref="phone" placeholder="请输入手机号码" autoFocus
                                value={this.state.phone} 
                                onChange={(event) => this.handlePhoneChange(event)} 
                                onFocus={() => this.handleInputFocus('phone')} 
                                onBlur={() => this.handleInputBlur()} />
                        </div>
                    </div >
                    <div className="login-verify-item">
                        <label>验证码</label>
                        <div className={`login-verify-input ${'code' === this.state.focusName ? "focus" : null}`}>
                            <input type="number" placeholder="请输入验证码" 
                                value={this.state.code} 
                                onChange={(event) => this.handleCodeChange(event)} 
                                onFocus={() => this.handleInputFocus('code')}
                                onBlur={() => this.handleInputBlur()}/>
                            <div className="login-verify-btn">
                                <Button type="primary" size="small" 
                                    onClick={() => this.handleSendCode()}
                                    disabled={this.state.sendingCodeStatus}>
                                    {this.state.sendingCodeStatus ? this.state.sendingCodeText : '发送验证码'}
                                </Button>
                            </div>
                        </div>
                    </div >
                    <div className="login-verify-bottom">
                        <Button type="primary"
                            onClick={() => this.handleSubmit()}
                            disabled={this.state.submitStatus}>
                            提交
                        </Button>
                    </div>
                </form>
            </div>
        )
    }
}

export default Login;