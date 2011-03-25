require 'dm-core'

class Node
  include DataMapper::Resource
  property :id, Serial, :required => true
  property :ip_address, String, :required => true
  property :port, Integer, :required => true
  property :uuid, Integer, :required => true, :unique => true
  property :supernode, Boolean, :default => false
  property :created_at, DateTime
  property :updated_at, DateTime
end
