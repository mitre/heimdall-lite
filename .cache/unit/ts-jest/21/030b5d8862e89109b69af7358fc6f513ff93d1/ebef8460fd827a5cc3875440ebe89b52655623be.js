"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** For helper functions that don't belong anywhere else */
/** Compares arrays a and b, returning a number indicating their lexicographic ordering
 * with the same output semantics.
 * That is,
 * a === b as determined by the comparator function, return 0;
 * if a is lexicographically before b, return < 0
 * if a is lexicographically after  b, return > 1
 */
function compare_arrays(a, b, comparator) {
    // Compare element-wise
    for (let i = 0; i < a.length && i < b.length; i++) {
        let x = comparator(a[i], b[i]);
        if (x) {
            return x;
        }
    }
    // If we escape the loop, make final decision based on difference in length
    if (a.length > b.length) {
        // a longer => a after b => return positive
        return 1;
    }
    else if (a.length === b.length) {
        // Completely equal
        return 0;
    }
    else {
        // b longer => a before b => Return negative
        return -1;
    }
}
exports.compare_arrays = compare_arrays;
/** Returns two values: if we need to redirect, and if so to where  */
function need_redirect_file(curr_target, data) {
    // If we have no files, always exit
    console.log("data.allFiles.length: " + data.allFiles.length);
    if (data.allFiles.length === 0) {
        return "root";
    }
    console.log("curr_target: " + curr_target);
    // If we have no filter (IE "all" is our curr route), we already know there are files, so its fine
    if (curr_target === null) {
        return "ok";
    }
    // We have a filter: check it's valid
    else {
        data.allFiles.forEach(data_file => {
            console.log(data_file.unique_id + ": " + data_file.filename);
        });
        if (data.allFiles.some(f => f.unique_id === curr_target)) {
            // This file exists
            return "ok";
        }
        else {
            // Just go to first in list
            return data.allFiles[0].unique_id;
        }
    }
}
exports.need_redirect_file = need_redirect_file;
/** Stores/retrives a simple JSON object from localstorage.
 * Will not store/retrieve methods - be advised! It won't work with class types!
 */
class LocalStorageVal {
    constructor(storage_key) {
        this.storage_key = storage_key;
    }
    /** Retrieves the currently held item, as resolved by JSON.parse */
    get() {
        // Fetch the string, failing early if not set
        let s = window.localStorage.getItem(this.storage_key);
        if (!s) {
            return null;
        }
        // Then try parsing. On fail, clear and go null
        try {
            let v = JSON.parse(s);
            return v;
        }
        catch (error) {
            this.clear();
            return null;
        }
    }
    /** Wraps get, providing the provided default if necessary */
    get_default(_default) {
        let v = this.get();
        if (v === null) {
            return _default;
        }
        else {
            return v;
        }
    }
    /** Sets the local storage value to the given value, stringified */
    set(val) {
        let nv = JSON.stringify(val);
        window.localStorage.setItem(this.storage_key, nv);
    }
    /** Clears the local storage value */
    clear() {
        window.localStorage.removeItem(this.storage_key);
    }
}
exports.LocalStorageVal = LocalStorageVal;
/** Groups items by using the provided key function */
function group_by(items, key_getter) {
    let result = {};
    for (let i of items) {
        // Get the items key
        let key = key_getter(i);
        // Get the list it should go in
        let corr_list = result[key];
        if (corr_list) {
            // If list exists, place
            corr_list.push(i);
        }
        else {
            // List does not exist; create and put
            result[key] = [i];
        }
    }
    return result;
}
exports.group_by = group_by;
/** Maps a hash to a new hash, with the same keys but each value replaced with a new (mapped) value */
function map_hash(old, map_function) {
    let result = {};
    for (let key in old) {
        result[key] = map_function(old[key]);
    }
    return result;
}
exports.map_hash = map_hash;
/** Converts a simple, single level json dict into uri params */
function to_uri_params(params) {
    let esc = encodeURIComponent;
    let query = Object.keys(params)
        .map(k => esc(k) + "=" + esc(params[k]))
        .join("&");
    return query;
}
exports.to_uri_params = to_uri_params;
/** Generate a basic authentication string for http requests */
function basic_auth(username, password) {
    return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}
exports.basic_auth = basic_auth;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvc3JjL3V0aWxpdGllcy9oZWxwZXJfdXRpbC50cyIsIm1hcHBpbmdzIjoiOztBQUdBLDJEQUEyRDtBQUUzRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixjQUFjLENBQzVCLENBQVcsRUFDWCxDQUFXLEVBQ1gsVUFBa0M7SUFFbEMsdUJBQXVCO0lBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pELElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEVBQUU7WUFDTCxPQUFPLENBQUMsQ0FBQztTQUNWO0tBQ0Y7SUFFRCwyRUFBMkU7SUFDM0UsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDdkIsMkNBQTJDO1FBQzNDLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7U0FBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNoQyxtQkFBbUI7UUFDbkIsT0FBTyxDQUFDLENBQUM7S0FDVjtTQUFNO1FBQ0wsNENBQTRDO1FBQzVDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDWDtBQUNILENBQUM7QUF4QkQsd0NBd0JDO0FBRUQsc0VBQXNFO0FBQ3RFLFNBQWdCLGtCQUFrQixDQUNoQyxXQUEwQixFQUMxQixJQUFzQjtJQUV0QixtQ0FBbUM7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzlCLE9BQU8sTUFBTSxDQUFDO0tB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QUMsQ0FBQyxDQUFDLENBQUM7U0FDbkI7S0FDRjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFwQkQsNEJBb0JDO0FBRUQsc0dBQXNHO0FBQ3RHLFNBQWdCLFFBQVEsQ0FDdEIsR0FBWSxFQUNaLFlBQXlCO0lBRXpCLElBQUksTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUN6QixLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRTtRQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQVRELDRCQVNDO0FBRUQsZ0VBQWdFO0FBQ2hFLFNBQWdCLGFBQWEsQ0FBQyxNQUF1QztJQUNuRSxJQUFJLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQztJQUM3QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDYixPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFORCxzQ0FNQztBQUVELCtEQUErRDtBQUMvRCxTQUFnQixVQUFVLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtJQUMzRCxPQUFPLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlFLENBQUM7QUFGRCxnQ0FFQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvc2pvc2hpL3Rlc3QvaGVpbWRhbGwtbGl0ZS9zcmMvdXRpbGl0aWVzL2hlbHBlcl91dGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJbnNwZWNEYXRhTW9kdWxlIGZyb20gXCJAL3N0b3JlL2RhdGFfc3RvcmVcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqIEZvciBoZWxwZXIgZnVuY3Rpb25zIHRoYXQgZG9uJ3QgYmVsb25nIGFueXdoZXJlIGVsc2UgKi9cblxuLyoqIENvbXBhcmVzIGFycmF5cyBhIGFuZCBiLCByZXR1cm5pbmcgYSBudW1iZXIgaW5kaWNhdGluZyB0aGVpciBsZXhpY29ncmFwaGljIG9yZGVyaW5nXG4gKiB3aXRoIHRoZSBzYW1lIG91dHB1dCBzZW1hbnRpY3MuXG4gKiBUaGF0IGlzLFxuICogYSA9PT0gYiBhcyBkZXRlcm1pbmVkIGJ5IHRoZSBjb21wYXJhdG9yIGZ1bmN0aW9uLCByZXR1cm4gMDtcbiAqIGlmIGEgaXMgbGV4aWNvZ3JhcGhpY2FsbHkgYmVmb3JlIGIsIHJldHVybiA8IDBcbiAqIGlmIGEgaXMgbGV4aWNvZ3JhcGhpY2FsbHkgYWZ0ZXIgIGIsIHJldHVybiA+IDFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVfYXJyYXlzPFQ+KFxuICBhOiBBcnJheTxUPixcbiAgYjogQXJyYXk8VD4sXG4gIGNvbXBhcmF0b3I6IChhOiBULCBiOiBUKSA9PiBudW1iZXJcbikge1xuICAvLyBDb21wYXJlIGVsZW1lbnQtd2lzZVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoICYmIGkgPCBiLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHggPSBjb21wYXJhdG9yKGFbaV0sIGJbaV0pO1xuICAgIGlmICh4KSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSBlc2NhcGUgdGhlIGxvb3AsIG1ha2UgZmluYWwgZGVjaXNpb24gYmFzZWQgb24gZGlmZmVyZW5jZSBpbiBsZW5ndGhcbiAgaWYgKGEubGVuZ3RoID4gYi5sZW5ndGgpIHtcbiAgICAvLyBhIGxvbmdlciA9PiBhIGFmdGVyIGIgPT4gcmV0dXJuIHBvc2l0aXZlXG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSBpZiAoYS5sZW5ndGggPT09IGIubGVuZ3RoKSB7XG4gICAgLy8gQ29tcGxldGVseSBlcXVhbFxuICAgIHJldHVybiAwO1xuICB9IGVsc2Uge1xuICAgIC8vIGIgbG9uZ2VyID0+IGEgYmVmb3JlIGIgPT4gUmV0dXJuIG5lZ2F0aXZlXG4gICAgcmV0dXJuIC0xO1xuICB9XG59XG5cbi8qKiBSZXR1cm5zIHR3byB2YWx1ZXM6IGlmIHdlIG5lZWQgdG8gcmVkaXJlY3QsIGFuZCBpZiBzbyB0byB3aGVyZSAgKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWVkX3JlZGlyZWN0X2ZpbGUoXG4gIGN1cnJfdGFyZ2V0OiBudW1iZXIgfCBudWxsLFxuICBkYXRhOiBJbnNwZWNEYXRhTW9kdWxlXG4pOiBcIm9rXCIgfCBudW1iZXIgfCBcInJvb3RcIiB7XG4gIC8vIElmIHdlIGhhdmUgbm8gZmlsZXMsIGFsd2F5cyBleGl0XG4gIGNvbnNvbGUubG9nKFwiZGF0YS5hbGxGaWxlcy5sZW5ndGg6IFwiICsgZGF0YS5hbGxGaWxlcy5sZW5ndGgpO1xuICBpZiAoZGF0YS5hbGxGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCJyb290XCI7XG4gIH1cblxuICBjb25zb2xlLmxvZyhcImN1cnJfdGFyZ2V0OiBcIiArIGN1cnJfdGFyZ2V0KTtcbiAgLy8gSWYgd2UgaGF2ZSBubyBmaWx0ZXIgKElFIFwiYWxsXCIgaXMgb3VyIGN1cnIgcm91dGUpLCB3ZSBhbHJlYWR5IGtub3cgdGhlcmUgYXJlIGZpbGVzLCBzbyBpdHMgZmluZVxuICBpZiAoY3Vycl90YXJnZXQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCJva1wiO1xuICB9XG4gIC8vIFdlIGhhdmUgYSBmaWx0ZXI6IGNoZWNrIGl0J3MgdmFsaWRcbiAgZWxzZSB7XG4gICAgZGF0YS5hbGxGaWxlcy5mb3JFYWNoKGRhdGFfZmlsZSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhkYXRhX2ZpbGUudW5pcXVlX2lkICsgXCI6IFwiICsgZGF0YV9maWxlLmZpbGVuYW1lKTtcbiAgICB9KTtcbiAgICBpZiAoZGF0YS5hbGxGaWxlcy5zb21lKGYgPT4gZi51bmlxdWVfaWQgPT09IGN1cnJfdGFyZ2V0KSkge1xuICAgICAgLy8gVGhpcyBmaWxlIGV4aXN0c1xuICAgICAgcmV0dXJuIFwib2tcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSnVzdCBnbyB0byBmaXJzdCBpbiBsaXN0XG4gICAgICByZXR1cm4gZGF0YS5hbGxGaWxlc1swXS51bmlxdWVfaWQ7XG4gICAgfVxuICB9XG59XG5cbi8qKiBTdG9yZXMvcmV0cml2ZXMgYSBzaW1wbGUgSlNPTiBvYmplY3QgZnJvbSBsb2NhbHN0b3JhZ2UuXG4gKiBXaWxsIG5vdCBzdG9yZS9yZXRyaWV2ZSBtZXRob2RzIC0gYmUgYWR2aXNlZCEgSXQgd29uJ3Qgd29yayB3aXRoIGNsYXNzIHR5cGVzIVxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxTdG9yYWdlVmFsPFQ+IHtcbiAgcHJpdmF0ZSBzdG9yYWdlX2tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2Vfa2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLnN0b3JhZ2Vfa2V5ID0gc3RvcmFnZV9rZXk7XG4gIH1cblxuICAvKiogUmV0cmlldmVzIHRoZSBjdXJyZW50bHkgaGVsZCBpdGVtLCBhcyByZXNvbHZlZCBieSBKU09OLnBhcnNlICovXG4gIGdldCgpOiBUIHwgbnVsbCB7XG4gICAgLy8gRmV0Y2ggdGhlIHN0cmluZywgZmFpbGluZyBlYXJseSBpZiBub3Qgc2V0XG4gICAgbGV0IHMgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zdG9yYWdlX2tleSk7XG4gICAgaWYgKCFzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBUaGVuIHRyeSBwYXJzaW5nLiBPbiBmYWlsLCBjbGVhciBhbmQgZ28gbnVsbFxuICAgIHRyeSB7XG4gICAgICBsZXQgdiA9IEpTT04ucGFyc2Uocyk7XG4gICAgICByZXR1cm4gdjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdyYXBzIGdldCwgcHJvdmlkaW5nIHRoZSBwcm92aWRlZCBkZWZhdWx0IGlmIG5lY2Vzc2FyeSAqL1xuICBnZXRfZGVmYXVsdChfZGVmYXVsdDogVCk6IFQge1xuICAgIGxldCB2ID0gdGhpcy5nZXQoKTtcbiAgICBpZiAodiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIF9kZWZhdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdjtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgbG9jYWwgc3RvcmFnZSB2YWx1ZSB0byB0aGUgZ2l2ZW4gdmFsdWUsIHN0cmluZ2lmaWVkICovXG4gIHNldCh2YWw6IFQpOiB2b2lkIHtcbiAgICBsZXQgbnYgPSBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2Vfa2V5LCBudik7XG4gIH1cblxuICAvKiogQ2xlYXJzIHRoZSBsb2NhbCBzdG9yYWdlIHZhbHVlICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2Vfa2V5KTtcbiAgfVxufVxuXG4vKiogQSB1c2VmdWwgc2hvcnRoYW5kICovXG5leHBvcnQgdHlwZSBIYXNoPFQ+ID0geyBba2V5OiBzdHJpbmddOiBUIH07XG5cbi8qKiBHcm91cHMgaXRlbXMgYnkgdXNpbmcgdGhlIHByb3ZpZGVkIGtleSBmdW5jdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwX2J5PFQ+KFxuICBpdGVtczogQXJyYXk8VD4sXG4gIGtleV9nZXR0ZXI6ICh2OiBUKSA9PiBzdHJpbmdcbik6IEhhc2g8QXJyYXk8VD4+IHtcbiAgbGV0IHJlc3VsdDogSGFzaDxBcnJheTxUPj4gPSB7fTtcbiAgZm9yIChsZXQgaSBvZiBpdGVtcykge1xuICAgIC8vIEdldCB0aGUgaXRlbXMga2V5XG4gICAgbGV0IGtleSA9IGtleV9nZXR0ZXIoaSk7XG5cbiAgICAvLyBHZXQgdGhlIGxpc3QgaXQgc2hvdWxkIGdvIGluXG4gICAgbGV0IGNvcnJfbGlzdCA9IHJlc3VsdFtrZXldO1xuICAgIGlmIChjb3JyX2xpc3QpIHtcbiAgICAgIC8vIElmIGxpc3QgZXhpc3RzLCBwbGFjZVxuICAgICAgY29ycl9saXN0LnB1c2goaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3QgZG9lcyBub3QgZXhpc3Q7IGNyZWF0ZSBhbmQgcHV0XG4gICAgICByZXN1bHRba2V5XSA9IFtpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIE1hcHMgYSBoYXNoIHRvIGEgbmV3IGhhc2gsIHdpdGggdGhlIHNhbWUga2V5cyBidXQgZWFjaCB2YWx1ZSByZXBsYWNlZCB3aXRoIGEgbmV3IChtYXBwZWQpIHZhbHVlICovXG5leHBvcnQgZnVuY3Rpb24gbWFwX2hhc2g8VCwgRz4oXG4gIG9sZDogSGFzaDxUPixcbiAgbWFwX2Z1bmN0aW9uOiAodjogVCkgPT4gR1xuKTogSGFzaDxHPiB7XG4gIGxldCByZXN1bHQ6IEhhc2g8Rz4gPSB7fTtcbiAgZm9yIChsZXQga2V5IGluIG9sZCkge1xuICAgIHJlc3VsdFtrZXldID0gbWFwX2Z1bmN0aW9uKG9sZFtrZXldKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogQ29udmVydHMgYSBzaW1wbGUsIHNpbmdsZSBsZXZlbCBqc29uIGRpY3QgaW50byB1cmkgcGFyYW1zICovXG5leHBvcnQgZnVuY3Rpb24gdG9fdXJpX3BhcmFtcyhwYXJhbXM6IEhhc2g8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbj4pIHtcbiAgbGV0IGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudDtcbiAgbGV0IHF1ZXJ5ID0gT2JqZWN0LmtleXMocGFyYW1zKVxuICAgIC5tYXAoayA9PiBlc2MoaykgKyBcIj1cIiArIGVzYyhwYXJhbXNba10pKVxuICAgIC5qb2luKFwiJlwiKTtcbiAgcmV0dXJuIHF1ZXJ5O1xufVxuXG4vKiogR2VuZXJhdGUgYSBiYXNpYyBhdXRoZW50aWNhdGlvbiBzdHJpbmcgZm9yIGh0dHAgcmVxdWVzdHMgKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNpY19hdXRoKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gXCJCYXNpYyBcIiArIEJ1ZmZlci5mcm9tKGAke3VzZXJuYW1lfToke3Bhc3N3b3JkfWApLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xufVxuIl0sInZlcnNpb24iOjN9