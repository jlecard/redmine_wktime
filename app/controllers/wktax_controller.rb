class WktaxController < WkbillingController

before_filter :require_login

    def index
		@tax_entries = nil
		if params[:taxname].blank?
			entries = WkTax.all
		else
			entries = WkTax.where("name like ?", "%#{params[:taxname]}%")
		end
		formPagination(entries)
    end
	
	def formPagination(entries)
		@entry_count = entries.count
        setLimitAndOffset()
		@tax_entries = entries.limit(@limit).offset(@offset)
	end
	
	def edit
	    @taxEntry = nil
	    unless params[:tax_id].blank?
		   @taxEntry = WkTax.find(params[:tax_id])
		end   
	end	
    
	def update	
		if params[:tax_id].blank?
		  wktax = WkTax.new
		else
		  wktax = WkTax.find(params[:tax_id])
		end
		wktax.name = params[:name]
		wktax.rate_pct = params[:rate_pct]
		if wktax.save()
		    redirect_to :controller => 'wktax',:action => 'index' , :tab => 'wktax'
		    flash[:notice] = l(:notice_successful_update)
		else
		    redirect_to :controller => 'wktax',:action => 'index' , :tab => 'wktax'
		    flash[:error] = wktax.errors.full_messages.join("<br>")
		end
    end
	
	def destroy
		WkTax.find(params[:tax_id].to_i).destroy
		flash[:notice] = l(:notice_successful_delete)
		redirect_back_or_default :action => 'index', :tab => params[:tab]
	end	
  
   def setLimitAndOffset		
		if api_request?
			@offset, @limit = api_offset_and_limit
			if !params[:limit].blank?
				@limit = params[:limit]
			end
			if !params[:offset].blank?
				@offset = params[:offset]
			end
		else
			@entry_pages = Paginator.new @entry_count, per_page_option, params['page']
			@limit = @entry_pages.per_page
			@offset = @entry_pages.offset
		end	
	end
end
