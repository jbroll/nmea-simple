
build:
	npm run build

rc:
	npm version prerelease --preid rc
	npm publish --tag rc --access public

publish:
	TAG=$$(eval echo $$(npm pkg get version)); npm version $${TAG%%-*}
	npm pkg get version



# echo npm verison ${TAG##-}
# npm version prerelease --preid rc
# npm publish --tag rc --access public
