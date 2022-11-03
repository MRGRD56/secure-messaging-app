navigator.serviceWorker.register("/sw.js", {
    scope: "/",
});

const getSwRegistration = (): Promise<ServiceWorkerRegistration> => {
    return navigator.serviceWorker.ready;
};

getSwRegistration().then();

export default getSwRegistration;
