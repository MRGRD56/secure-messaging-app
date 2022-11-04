import sjcl from 'sjcl';

const hashSecretKey = (value: string): string => {
    return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`&*Y*76t@${value}@UH(8he`));
};

export default hashSecretKey;
