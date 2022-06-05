import sjcl from 'sjcl';

const sha256 = (text: string): string => {
    return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(text));
};

export default sha256;
