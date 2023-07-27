import React from 'react';
import axios from 'axios';

const clientId = '5c8c13bf8db04f799315ee049acecb17';
const redirectUri = 'http://localhost:3000/callback';

const SpotifyLogin = () => {
    
    const handleLogin = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (!code) {
            redirectToAuthCodeFlow(clientId);
        } else {
            const accessToken = await getAccessToken(clientId, code);
            console.log("got token!")
            const profile = await fetchProfile(accessToken);
            console.log("profile data: ", profile);

        }

            // TODO: Redirect to Spotify authorization page
        async function redirectToAuthCodeFlow(clientId) {
                const verifier = generateCodeVerifier(128);
                const challenge = await generateCodeChallenge(verifier);
            
                localStorage.setItem("verifier", verifier);
            
                const params = new URLSearchParams();
                params.append("client_id", clientId);
                params.append("response_type", "code");
                params.append("redirect_uri", redirectUri);
                params.append("scope", "user-read-private user-read-email streaming");
                params.append("code_challenge_method", "S256");
                params.append("code_challenge", challenge);
            
                document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
                console.log("success!")
                const returnedParams = new URLSearchParams(window.location.search);
                const code = returnedParams.get("code");
                const accessToken = await getAccessToken(clientId, code);
                console.log("got token!")
                const profile = await fetchProfile(accessToken);
                console.log("profile data: ", profile);

            }
            
            function generateCodeVerifier(length) {
                let text = '';
                let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            
                for (let i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }
            
            async function generateCodeChallenge(codeVerifier) {
                const data = new TextEncoder().encode(codeVerifier);
                const digest = await window.crypto.subtle.digest('SHA-256', data);
                return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
            }


        // TODO: Get access token for code
        async function getAccessToken(clientId, code) {
            const verifier = localStorage.getItem("verifier");
            console.log("made it to getAccessToken")
            console.log(`code: ${code}, verifier: ${verifier}`)

            const params = new URLSearchParams();
            params.append("client_id", clientId);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", "http://localhost:3000/callback");
            params.append("code_verifier", verifier);

            const result = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            });
            // .then(result => {
            //     if (!result.ok) {
            //       throw new Error('HTTP status ' + result.status);
            //     }
            //     return result.json();
            //   })
            //   .then(data => {
            //     localStorage.setItem('access_token', data.access_token);
            //   })
            //   .catch(error => {
            //     console.error('Error:', error);
            //   });
            console.log(result)
            const { access_token } = await result.json();
            console.log(access_token);
            return access_token;
        }


        async function fetchProfile(token) {
            const result = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", headers: { Authorization: `Bearer ${token}` }
            });

            return await result.json();
        }
    }
    
    return (<button onClick={handleLogin}>Log into Spotify to start!</button>);
}

export default SpotifyLogin;