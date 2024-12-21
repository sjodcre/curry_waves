import { Othent, UserDetails } from '@othent/kms';

const othent = new Othent({
  appInfo: {
      name: 'AWWWWWWWWWESOME',
      version: '1.0.0',
      env: 'development', // or 'development'
  },
	throwErrors: false,
  // inject: true,
  autoConnect: 'off', // Use string literal instead of enum
  persistLocalStorage: true,
  auth0Cache: 'localstorage', // Store tokens in localStorage


});

othent.addEventListener("error", (err: any) => {
	console.error(err);
  });

othent.addEventListener("auth", (userDetails: UserDetails | null, isAuthenticated: boolean) => {
  // If `userDetails != null` and `isAuthenticated = false`, this value comes from the cache.
  console.log("userDetails", userDetails);
  console.log("isAuthenticated", isAuthenticated);
});


othent.startTabSynching();


export default othent;