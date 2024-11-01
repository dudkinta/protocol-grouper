# Protocol Grouper Service

`ProtocolGrouperService` is a service for the libp2p framework that helps to group peers by the protocols they support. It also allows you to retrieve peers by protocol and retrieve protocols supported by a specific peer. This service is particularly useful in networking applications where protocol-based peer grouping and management is required.

## Features

- **Peer Grouping by Protocol**: Maintains a map of protocols and the peers that support them.
- **Protocol Management for Peers**: Tracks the protocols each peer supports.
- **Event Emitter**: Emits events when a new protocol is added to a peer.

## Installation

To install the `ProtocolGrouperService`, use npm:

```sh
npm install @tgbc/protocol-grouper
```

## Usage

### Importing the Module

```javascript
import { protocolGrouper } from '@tgbc/protocol-grouper';
import { createLibp2p } from 'libp2p';
```

### Creating an Instance

Create an instance of `ProtocolGrouperService` and integrate it into a libp2p node:

```javascript
const node = await createLibp2p({
  // other libp2p configurations
  services: {
    protocolGrouper: protocolGrouper()
  }
});
```

### Subscribing to Events

You can subscribe to the `'protocolGrouper:add'` event to listen for new protocol additions:

```javascript
node.addEventListener('protocolGrouper:add', (event) => {
  const { peerId, protocol } = event.detail;
  console.log(`Protocol ${protocol} added to peer ${peerId}`);
});
```

### Methods

#### `getPeers(protocol: string): string[]`

Returns a list of peer IDs that support the given protocol.

```javascript
const peers = node.services.protocolGrouper.getPeers('/chat/1.0.0');
console.log('Peers supporting /chat/1.0.0:', peers);
```

#### `getProtocols(peerId: string): string[]`

Returns a list of protocols supported by the given peer.

```javascript
const protocols = node.services.protocolGrouper.getProtocols('12D3KooW...');
console.log('Protocols supported by peer:', protocols);
```

## Events

The `ProtocolGrouperService` emits the following event:

- **`protocolGrouper:add`**: Triggered when a new protocol is added to a peer. The event includes `peerId` and `protocol` in its detail.

## License

This module is licensed under the ISC License.

