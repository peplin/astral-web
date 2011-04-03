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
    DataMapper.setup(:default, (ENV["DATABASE_URL"] || "sqlite3:///#{Dir.pwd}/development.sqlite3"))
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
    @stream = Stream.create(:title => params[:title],
                            :description => params[:description])
    redirect "/stream/#{@stream.id}"
  end

  get '/stream/:id' do |id|
    @stream = Stream.get(id)
    raise Sinatra::NotFound if not @stream
    haml :stream
  end

  get '/nodes', :provides => 'json' do
    content_type :json
    {'nodes' => Node.all}.to_json
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
      status 400
      body node.errors.to_hash.to_json
    end
  end

  delete '/node/:uuid' do |uuid|
    Node.get!(uuid).destroy
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

  not_found do
    haml :'404'
  end

  run! if app_file == $0
end
