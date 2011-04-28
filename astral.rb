require 'sinatra/base'
require 'haml'
require 'sinatra/static_assets'
require 'datamapper'

Dir["./models/*.rb"].each {|f| require f }

class Astral < Sinatra::Base
  helpers Sinatra::UrlForHelper
  register Sinatra::StaticAssets

  configure do
    set :app_file, __FILE__
    set :title, "Astral"
    DataMapper.setup(:default,
        ENV["DATABASE_URL"] || "sqlite3:///#{Dir.pwd}/development.sqlite3")
    DataMapper.auto_upgrade!

    use Rack::Session::Cookie, :secret => "769bee166fa932c1ee9bc4129a52d11a3a"
  end

  get '/' do
    @streams = Stream.all
    haml :browse
  end

  get '/streams', :provides => 'json' do
    content_type :json
    {'streams' => Stream.all}.to_json
  end

  post '/streams' do
    data = JSON.parse request.body.read
    if Stream.first(:slug => data["slug"])
      status 400
    else
      @stream = Stream.create(:slug => data["slug"],
                              :source_uuid => data["source_uuid"],
                              :name => data["name"],
                              :description => data["description"])
      redirect "/stream/#{@stream.slug}/publish"
    end
  end

  get '/stream/:slug', :provides => 'html' do
    @stream = Stream.first(:slug => params[:slug])
    raise Sinatra::NotFound if not @stream
    haml :stream
  end

  get '/stream/:slug', :provides => 'json' do
    content_type :json
    @stream = Stream.first(:slug => params[:slug])
    raise Sinatra::NotFound if not @stream
    {'stream' => @stream}.to_json
  end

  get '/stream/:slug/publish' do
    @stream = Stream.first(:slug => params[:slug])
    raise Sinatra::NotFound if not @stream
    haml :publish
  end

  get '/nodes', :provides => 'json' do
    content_type :json
    {'nodes' => Node.all}.to_json
  end

  get '/nodes', :provides => 'html' do
    @nodes = Node.all
    haml :nodes
  end

  post '/nodes' do
    request.body.rewind
    data = JSON.parse request.body.read
    data.delete "primary_supernode_uuid"
    node = Node.first(:uuid => data["uuid"])
    if node
      node.update(data)
    else
      node = Node.create(data)
    end

    if node and not node.valid?
      content_type :json
      status 400
      body node.errors.to_hash.to_json
    end
  end

  delete '/node/:uuid' do |uuid|
    node = Node.get(uuid)
    node.destroy if node
  end

  get '/upload' do
    haml :upload
  end

  get '/download' do
    haml :download
  end

  get '/about' do
    haml :about
  end

  get '/visualization' do
    haml :visualization
  end

  post '/ping' do
  end

  get '/ping' do
    content_type :json
    {'ip' => request.ip}.to_json
  end

  not_found do
    haml :'404'
  end

  run! if app_file == $0
end
