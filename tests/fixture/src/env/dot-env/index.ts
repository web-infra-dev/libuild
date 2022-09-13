export const isNativeRemapping = () => {
  return process.env.LIBUILD_NATIVE_REMAPPING;
};

export const getNodeEnv = () => {
  return process.env.NODE_ENV;
};
