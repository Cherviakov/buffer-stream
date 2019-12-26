const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');

class BufStream extends Readable {
  constructor (buffer) {
    super();
    this.position = 0;
    this.isFinished = false;
    if (Buffer.isBuffer(buffer)) {
      this.buffer = buffer;
    } else {
      throw new Error(`${buffer} is not a Buffer`);
    }
  }

  _read (size) {
    try {
      const currSize = Math.min(size, this.buffer.length - this.position);
      if (currSize > 0) {
        const buf = Buffer.alloc(currSize);
        this.buffer.copy(buf, this.position, 0, currSize);
        this.position += currSize;
        this.push(buf);
      } else {
        this.push(null);
      }
    } catch (err) {
      process.nextTick(() => this.emit('error', err)); 
    }
    if (!this.isFinished && this.position === this.buffer.length) {
      this.isFinished = true;
      process.nextTick(() => this.emit('finish'));
    }
  }
}

const buffer = Buffer.from('Hello world!');
const readable = new BufStream(buffer);
const writable = fs.createWriteStream(path.resolve('hello.txt'));

readable.on('error', (err) => {
  console.error(err);
  readable.destroy();
  writable.destroy();
});

readable.on('finish', () => console.log('finished'));

readable.pipe(writable);
