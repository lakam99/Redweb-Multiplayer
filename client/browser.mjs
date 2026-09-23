import { NetClient } from './Net.mjs';

const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/match`;
const Net = new NetClient(url);

export default Net;
