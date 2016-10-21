'use strict'

const util = require('./util')
const cidForHash = require('./common').cidForHash

exports = module.exports

exports.multicodec = 'eth-block'

/*
 * resolve: receives a path and a block and returns the value on path,
 * throw if not possible. `block` is an IPFS Block instance (contains data + key)
 */
exports.resolve = (block, path) => {
  let node = util.deserialize(block.data)

  // root

  if (!path || path === '/') {
    return { value: node, remainderPath: '' }
  }

  // check tree results

  let pathParts = path.split('/')
  let firstPart = pathParts.shift()
  let remainderPath = pathParts.join('/')

  let treeResult = exports.tree(block).find(child => child.path === firstPart)

  if (!treeResult) {
    throw new Error('Path not found ("' + firstPart + '").')
  }

  return {
    value: treeResult.value,
    remainderPath: remainderPath,
  }

}

/*
 * tree: returns a flattened array with paths: values of the project. options
 * are option (i.e. nestness)
 */

exports.tree = (block, options) => {
  if (!options) {
    options = {}
  }

  const blockHeader = util.deserialize(block.data)
  const paths = []  

  // external links
  paths.push({
    path: 'parent',
    value: { '/': cidForHash('eth-block', blockHeader.parentHash) },
  })
  paths.push({
    path: 'ommers',
    value: { '/': cidForHash('eth-block-list', blockHeader.uncleHash) },
  })
  paths.push({
    path: 'transactions',
    value: { '/': cidForHash('eth-tx-trie', blockHeader.transactionsTrie) },
  })
  paths.push({
    path: 'transactionReceipts',
    value: { '/': cidForHash('eth-tx-receipt-trie', blockHeader.receiptTrie) },
  })
  paths.push({
    path: 'state',
    value: { '/': cidForHash('eth-state-trie', blockHeader.stateRoot) },
  })

  // external links as data
  paths.push({
    path: 'parentHash',
    value: blockHeader.parentHash,
  })
  paths.push({
    path: 'ommerHash',
    value: blockHeader.uncleHash,
  })
  paths.push({
    path: 'transactionTrieRoot',
    value: blockHeader.transactionsTrie,
  })
  paths.push({
    path: 'transactionReceiptTrieRoot',
    value: blockHeader.receiptTrie,
  })
  paths.push({
    path: 'stateRoot',
    value: blockHeader.stateRoot,
  })

  // internal data
  paths.push({
    path: 'authorAddress',
    value: blockHeader.coinbase,
  })
  paths.push({
    path: 'bloom',
    value: blockHeader.bloom,
  })
  paths.push({
    path: 'difficulty',
    value: blockHeader.difficulty,
  })
  paths.push({
    path: 'number',
    value: blockHeader.number,
  })
  paths.push({
    path: 'gasLimit',
    value: blockHeader.gasLimit,
  })
  paths.push({
    path: 'gasUsed',
    value: blockHeader.gasUsed,
  })
  paths.push({
    path: 'timestamp',
    value: blockHeader.timestamp,
  })
  paths.push({
    path: 'extraData',
    value: blockHeader.extraData,
  })
  paths.push({
    path: 'mixHash',
    value: blockHeader.mixHash,
  })
  paths.push({
    path: 'nonce',
    value: blockHeader.nonce,
  })

  return paths

}