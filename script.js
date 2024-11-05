@keyframes moveToCenter {
    from {
        transform: translate(0, 0);
    }
    to {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}

.bomb {
    position: absolute;
    width: 50px;
    height: 50px;
}

#bombA {
    top: 0;
    left: 0;
}

#bombB {
    top: 0;
    right: 0;
}

#bombC {
    bottom: 0;
    left: 0;
}

#bombD {
    bottom: 0;
    right: 0;
}
