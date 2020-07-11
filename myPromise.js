class KPromise {
  constructor(handle) {
    this.status = "pending";
    this.value = undefined;
    this.resolvedQueue = [];
    this.rejectedQueue = [];
    handle(this._resolve.bind(this), this._reject.bind(this));
  }
  _resolve (val) {
    this.status = "resolved";
    this.value = val;
    let run = () => {
      let cb;
      while (cb = this.resolvedQueue.shift()) {
        cb(val);
      }
    }
    let observer = new MutationObserver(run)
    observer.observe(document.body, {
      attributes: true
    })
    document.body.setAttribute("kkb", Math.random());
  }
  _reject (err) {
    this.status = "rejected";
    this.value = err;
    let run = () => {
      let cb;
      while (cb = this.rejectedQueue.shift()) {
        cb(err);
      }
    }
    let observer = new MutationObserver(run)
    observer.observe(document.body, {
      attributes: true
    })
    document.body.setAttribute("kkb", Math.random());
  }
  then (onResolved, onRejected) {
    return new KPromise((resolve, reject) => {
      this.resolvedQueue.push(val => {
        val = onResolved && onResolved(val)
        if (val instanceof KPromise) {
          return val.then(resolve);
        }
        resolve(val);
      })
      this.rejectedQueue.push(err => {
        onRejected && onRejected(err);
        reject(err);
      })
    })
  }
  static resolve (val) {
    return new KPromise(resolve => {
      resolve(val);
    })
  }
  static reject (val) {
    return new KPromise((resolve, reject) => {
      reject(val);
    })
  }
  static all (lists) {
    return new KPromise((resolve, reject) => {
      let arr = [];
      for (let i = 0; i < lists.length; i++) {
        lists[i].then(res => {
          arr.push(res);
        }, err => {
          reject(err);
          throw Error("error..")
        })
      }
      resolve(arr);
    })
  }
  static race (lists) {
    return new KPromise((resolve, reject) => {
      for (let i = 0; i < lists.length; i++) {
        lists[i].then(res => {
          resolve(res)
        }, err => {
          reject(err);
        })
      }
    })
  }
  catch (onRejected) {
    this.then(undefined, onRejected);
  }
  finally (fn) {
    return new KPromise((resolve, reject) => {
      this.resolvedQueue.push(fn);
      this.rejectedQueue.push(fn);
    })
  }
}