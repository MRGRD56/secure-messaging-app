class CancellationToken {
    get isCancelled(): boolean {
        return this._isCancelled;
    }

    cancel(): void {
        this._isCancelled = true;
    }

    private _isCancelled: boolean = false;
}

export default CancellationToken;
