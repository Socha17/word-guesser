// main.tsx

import './createPost.tsx';
import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true, // Enable Redis if needed
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Word Scramble Game',
  height: 'tall',
  render: (context) => {
    // Load username with `useState` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    // When the web view invokes `window.parent.postMessage`, this function is called
    const onMessage = (_msg: any) => {
      // No messages to handle from the web view in this version
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = () => {
      setWebviewVisible(true);

      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
        },
      });
    };

    // Render the custom post type
    return (
      <zstack
        grow
        padding="small"
        height="100%"
        width="100%"
      >
        {/* Background Image */}
        <image
          url="background.png"               // Ensure 'background.png' is in the /assets folder
          imageWidth={1500}                  // Replace with your image's intrinsic width
          imageHeight={1024}                 // Replace with your image's intrinsic height
          height="100%"                      // Cover full height
          width="100%"                       // Cover full width
          resizeMode="cover"                 // Scale to cover
          description="Background Image"     // Accessibility description
        />

        {/* Content Container */}
        {!webviewVisible && (
          <vstack
            grow
            alignment="middle center"         // Center content vertically and horizontally
            style={{ zIndex: 1 }}
            width="100%"
            height="100%"
          >
            <text
              size="xxlarge"
              weight="bold"
              color="#4e826c"
              alignment="center middle"                // Center text
            >
              Word Scramble Game
            </text>
            <spacer />
            <vstack alignment="center middle" width="100%">
              <hstack padding="small">
                <text size="large" color="#4e826c">Username: </text>
                <text size="large" weight="bold"  color="#4e826c">
                  {username ?? ''}
                </text>
              </hstack>
            </vstack>
            <spacer />
            <button
              onPress={onShowWebviewClick}
              alignment="center"                 // Center the button horizontally
              style={{ alignSelf: 'center' }}    // Ensure the button is centered
            >
              Start Game
            </button>
          </vstack>
        )}

        {/* WebView Container */}
        {webviewVisible && (
          <webview
            id="myWebView"
            url="page.html"
            onMessage={(msg) => onMessage(msg)}
            height="100%"
            width="100%"
            grow
            style={{ zIndex: 2 }} // Ensure webview is above other elements
          />
        )}
      </zstack>
    );
  },
});

export default Devvit;
