import React, { useState, useEffect } from 'react';
import useBus, { dispatch as emit } from 'use-bus';

import SignalingChannelUI from './signaling-ui';

import { addr } from 'src/env-config';


const socket = window.socket || new WebSocket(addr);
window.socket = socket;

const SignalingChannel = () => {
    const [channel,        setChannel]        = useState(socket);
    const [isReadyChannel, setIsReadyChannel] = useState(false);

    const [login,          setLogin]          = useState(null);
    const [joinRoom,       setJoinRoom]       = useState(null);
    const [logout,         setLogout]         = useState(null);

    const [waitOffer,      setWaitOffer]      = useState(null);
    const [offer,          setOffer]          = useState(null);
    const [answer,         setAnswer]         = useState(null);
    const [candidate,      setCandidate]      = useState(null);

    useBus("login",      send);
    useBus("join-room",  send);
    useBus("logout",     send);

    useBus("wait-offer", send);
    useBus("offer",      send);
    useBus("answer",     send);
    useBus("candidate",  send);

    // Websocket events

    useEffect(() => {
        if (channel && channel.readyState === 1) {
            setIsReadyChannel(true);
        }

        if (channel) {
            channel.addEventListener("open", () => {
                setIsReadyChannel(true);
            });
            channel.addEventListener("message", transferMessage);
        }
    }, [channel]);

    useEffect(() => {
        if (isReadyChannel) {
            emit("channel-opened");
        }
    }, [isReadyChannel]);

    // Signaling events

    useEffect(() => {
        if (login) {
            emit({
                ...login,
                type: "response-login",
            });
        }
    }, [login]);

    useEffect(() => {
        if (joinRoom) {
            emit({
                ...joinRoom,
                type: "response-join-room",
            });
        }
    }, [joinRoom]);

    useEffect(() => {
        if (logout) {
            emit({
                ...logout,
                type: "response-logout",
            });
        }
    }, [logout]);

    useEffect(() => {
        if (waitOffer) {
            emit({
                ...waitOffer,
                type: "response-wait-offer",
            });
        }
    }, [waitOffer]);

    useEffect(() => {
        if (offer) {
            emit({
                ...offer,
                type: "response-offer",
            });
        }
    }, [offer]);

    useEffect(() => {
        if (answer) {
            emit({
                ...answer,
                type: "response-answer",
            });
        }
    }, [answer]);

    useEffect(() => {
        if (candidate) {
            emit({
                ...candidate,
                type: "response-candidate",
            });
        }
    }, [candidate]);

    function transferMessage({ data }) {
        const message = parseMessage(data);

        switch(message.type) {
            case "login":
                setLogin(message);
                break;
            case "join-room":
                setJoinRoom(message);
                break;
            case "logout":
                setLogout(message);
                break;
            case "wait-offer":
                setWaitOffer(message);
                break;
            case "offer":
                setOffer(message);
                break;
            case "answer":
                setAnswer(message);
                break;
            case "candidate":
                setCandidate(message);
                break;
            default:
                break;
        }
    }

    function parseMessage(message) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        return data;
    }

    function send(message) {
        channel.send(JSON.stringify(message));
    }

    return (
        <SignalingChannelUI />
    );
};

export default SignalingChannel;
