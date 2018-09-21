import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Grid } from 'react-bootstrap';
import Promise from 'bluebird';
const qs = require('querystring');
import RetinaImage from 'react-retina-image';
import eth2air from 'eth2air-core';
import ButtonPrimary from './../common/ButtonPrimary';
import { SpinnerOrError, Loader } from './../common/Spinner';
import WithHistory from './../HistoryScreen/WithHistory';
import { authenticate, getCampaignByContractAddress, getCampaignByReferralCode } from './../../services/AuthService';
import styles from './../ClaimScreen/styles';
import PoweredByVolca from './../common/poweredByVolca';
import CompletedReceivedScreen from './../Transfer/CompletedReceivedScreen';
import { ButtonLoader } from './../common/Spinner';
import GoogleLogin from 'react-google-login';
import Header from './../common/Header/ReferalHeader';



class AuthScreen extends Component {
    constructor(props) {
        super(props);

        // parse URL params
        const queryParams = qs.parse(props.location.search.substring(1));
        const { c: contractAddress, ref: referralCode } = queryParams;

        this.state = {
            contractAddress,
            referralCode,
            loading: true,
            errorMessage: "",
            fetching: false,
            tokenSymbol: null,
            amount: null,
            tokenAddress: null,
            imageExists: true
        };
    }

    componentDidMount() {
        this._getCampaignParams();
    }

    async _getCampaignParams() {
        try {
	    let result;
	    if (this.state.contractAddress) {	    
		result = await getCampaignByContractAddress(this.state.contractAddress);
	    } else {
		result = await getCampaignByReferralCode(this.state.referralCode);
	    }

	    const { campaign, referree, referralAddress } = result;
	    console.log({campaign, referree, referralAddress});
	    
            // update UI
            this.setState({
                tokenSymbol: campaign.symbol,
                amount: campaign.amount,
                tokenAddress: campaign.tokenAddress,
		referralAddress: (referralAddress || "0x0000000000000000000000000000000000000000"),
		referree,
                loading: false
            });

        } catch (err) {
            console.log(err);
            alert("Couldn't get airdrop details. Error details in the console.");
        }
    }


    async onGoogleResponse(response) {
        console.log({ response, state: this.state });

        try {
            const authResult = await authenticate({
                googleTokenId: response.tokenId,
                referralAddress: this.state.referralAddress,
                contractAddress: this.state.contractAddress
            });
            console.log({ authResult });
            if (authResult.success && authResult.link) {
                window.location.assign(authResult.link);
            }

        } catch (err) {
            console.log(err)
            alert("Error while authenticating");
        }
    }

    _renderWithTokenIcon() {
	return (
	    <div>
	      <RetinaImage className="img-responsive" style={{ ...styles.tokenIcon }} src={`https://raw.githubusercontent.com/Eth2io/eth2-assets/master/images/doge_token.png`} onError={(e) => { this.setState({ imageExists: false }) }} />
		
                <div style={{ ...styles.amountContainer, width: 300, margin: 'auto' }}>
                  <div style={{ ...styles.title, fontFamily: 'Inter UI Black' }}>Sign in to claim<br/> <span style={styles.amountSymbol}><span style={{ fontFamily: 'Inter UI Bold' }}>{this.state.amount}</span> {this.state.tokenSymbol}</span><span style={{ fontFamily: 'Inter UI Bold' }}> ($25)</span></div>
                </div>
	    </div>
	);
    }

    _renderWithAvatar() {
	return (
	    <div>
	      <RetinaImage className="img-responsive" style={{ ...styles.tokenIcon }} src={this.state.referree.picture} onError={(e) => { this.setState({ imageExists: false }) }} />
		
                <div style={{ ...styles.amountContainer, width: 300, margin: 'auto' }}>
                  <div style={{ ...styles.title, fontFamily: 'Inter UI Black' }}>{this.state.referree.given_name} sent you<br/> <span style={styles.amountSymbol}><span style={{ fontFamily: 'Inter UI Bold' }}>{this.state.amount}</span> {this.state.tokenSymbol}</span><span style={{ fontFamily: 'Inter UI Bold' }}> ($25)</span></div>
                </div>
	    </div>
	);
    }

    
    _renderConfirmDetailsForm() {
        // wait until loaded
        if (this.state.loading) {
            return (<Loader text="Getting airdrop details..." textLeftMarginOffset={-50} />);
        }

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ height: 250 }}>
                    
		  { this.state.referree ? this._renderWithAvatar() : this._renderWithTokenIcon() }
		  
                    <div style={styles.formContainer}>
                        <div style={styles.button}>
                            <GoogleLogin style={{ width: 300, height: 50, paddingLeft: 20, paddingRight: 20, display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#979797', borderRadius: 10, fontSize: 20, fontFamily: 'Inter UI Bold' }}
                                clientId="954902551746-leebjqk6hs426eivvvvbicr1adntat9s.apps.googleusercontent.com"
                                onSuccess={this.onGoogleResponse.bind(this)}
                                onFailure={this.onGoogleResponse.bind(this)}>
                                <RetinaImage className="img-responsive" src={`https://raw.githubusercontent.com/Eth2io/eth2-assets/master/images/google_icon.png`} style={{ display: 'inline' }} onError={(e) => { this.setState({ imageExists: false }) }} />
                                Sign in with Google
			    </GoogleLogin>
                        </div>
                        <div style={{ fontFamily: 'Inter UI Regular', fontSize: 14, color: '#979797', textAlign: 'center', marginTop: 20 }}>We ask for email, photo and name</div>
                        <div style={{ textAlign: 'center', marginTop: 20 }}>

                        </div>
                        <SpinnerOrError fetching={false} error={this.state.errorMessage} />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <Header />
                <Grid>
                    <Row>
                        <Col sm={4} smOffset={4}>
                            <div>
                                {this._renderConfirmDetailsForm()}
                            </div>
                        </Col>
                    </Row>
                </Grid>
                <PoweredByVolca />
            </div>
        );
    }
}


export default AuthScreen;
