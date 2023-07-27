import React from 'react';
import axios from 'axios';
import {saveAs} from 'file-saver';
// import {fs} from 'fs';
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const SpotifyAuth = () => {
    const handleAuth = async () => {
        localStorage.clear();
        function generateRandomString(length) {
            let text = '';
            let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for (let i = 0; i < length; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
    
        let state = generateRandomString(16);
        let scope = 'user-read-private user-read-email';
        let show_dialog = false;
        let args = new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state,
            show_dialog: show_dialog
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
        
        const requestAccessToken = async () => {
            const urlParams = window.location.href;
            let code = urlParams.get('code');
            console.log("Made it to this point with code and state returned.");

            let body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
            });

            const response = fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
                },
                body: body
                })
                .then(response => {
                    if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                    }
                    console.log(response)
                    // fs.writeFile('TestFile.txt', response, (err) => {
                    //     if (err) throw err;
                    // });
                    localStorage.setItem('response', response.json());
                    return response.json();
                })
                .then(data => {
                    localStorage.setItem('access_token', data.access_token);
                    console.log(data.access_token);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
                const access_token = await response;
                console.log(access_token);
                return access_token;
        }
        async function fetchProfile(token) {
            const result = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", headers: { Authorization: `Bearer ${token}` }
            });

            return await result.json();
                    
        }
            const accessToken =  await requestAccessToken();
            console.log("got token!", accessToken);
            const profile = await fetchProfile("BQD3PZdxQQ97di5Jtkcc0-WG3Ir80J3CfR07V-I573l67awDfA3tvmSN1ZDnNDQAtve823rP64zIRdz_xLk8wk7Hms4O5KCSvI1-FyqEsXvkE8H2zrUu9ckOI0HCkZvxzcxOZ5pr-SGzBV3kxz9lX3Ml3VfJgyRjyNme9zZCg87XNktGkD_TYHdK6BpztHI");
            console.log("got profile!", profile);
            localStorage.setItem('profile', profile);

    }

    
    return (<button onClick={handleAuth}>Log into Spotify to start! FR!! </button>);
}
export default SpotifyAuth;